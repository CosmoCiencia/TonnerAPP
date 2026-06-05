import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.87.1';

const API_FOOTBALL_BASE_URL = 'https://v3.football.api-sports.io';
const WORLD_CUP_LEAGUE_ID = 1;
const WORLD_CUP_SEASON = 2026;

type SyncRequestBody = {
  league?: number;
  season?: number;
  team_ids?: number[];
};

type CupMatchTeamRow = {
  home_team_id: number | null;
  home_team_name: string | null;
  away_team_id: number | null;
  away_team_name: string | null;
};

type TeamSyncTarget = {
  team_id: number;
  team_name: string | null;
};

type ApiFootballSquadPlayer = {
  id?: number | null;
  name?: string | null;
  age?: number | null;
  number?: number | null;
  position?: string | null;
  photo?: string | null;
};

type ApiFootballSquad = {
  team?: {
    id?: number | null;
    name?: string | null;
    logo?: string | null;
  } | null;
  players?: ApiFootballSquadPlayer[];
};

type ApiFootballSquadsResponse = {
  errors?: unknown;
  results?: number;
  response?: ApiFootballSquad[];
};

type CupTeamPlayerUpsert = {
  team_id: number;
  team_name: string | null;
  player_id: number;
  player_name: string;
  age: number | null;
  number: number | null;
  position: string | null;
  photo: string | null;
  raw: ApiFootballSquadPlayer;
};

type TeamSyncResult = {
  team_id: number;
  team_name: string | null;
  players_received: number;
  players_upserted: number;
};

type TeamSyncFailure = {
  team_id: number;
  team_name: string | null;
  error: string;
};

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
    },
  });
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === 'string') return error;

  try {
    return JSON.stringify(error);
  } catch {
    return String(error);
  }
}

function requireEnv(name: string): string {
  const value = Deno.env.get(name)?.trim();

  if (!value) {
    throw new Error(`Missing required env var: ${name}`);
  }

  return value;
}

function authorizeInternalRequest(request: Request): Response | null {
  const expectedSecret = requireEnv('SYNC_CUP_SECRET');
  const receivedSecret = request.headers.get('x-tonner-sync-secret')?.trim();

  if (!receivedSecret || receivedSecret !== expectedSecret) {
    return jsonResponse({ ok: false, error: 'Unauthorized squads sync request.' }, 401);
  }

  return null;
}

async function parseRequest(request: Request): Promise<Required<Pick<SyncRequestBody, 'league' | 'season'>> & { team_ids?: number[] }> {
  const body = (await request.json().catch(() => ({}))) as SyncRequestBody;
  const league = Number(body.league ?? WORLD_CUP_LEAGUE_ID);
  const season = Number(body.season ?? WORLD_CUP_SEASON);

  if (league !== WORLD_CUP_LEAGUE_ID || season !== WORLD_CUP_SEASON) {
    throw new Error('sync-cup-squads only supports World Cup league=1 season=2026.');
  }

  const teamIds = Array.isArray(body.team_ids)
    ? [...new Set(body.team_ids.map(Number).filter((teamId) => Number.isInteger(teamId) && teamId > 0))]
    : undefined;

  return {
    league,
    season,
    team_ids: teamIds,
  };
}

function getTeamTargets(rows: CupMatchTeamRow[], selectedTeamIds?: number[]): TeamSyncTarget[] {
  const selected = selectedTeamIds ? new Set(selectedTeamIds) : null;
  const teams = new Map<number, string | null>();

  for (const row of rows) {
    if (Number.isInteger(row.home_team_id) && (!selected || selected.has(row.home_team_id as number))) {
      teams.set(row.home_team_id as number, row.home_team_name ?? null);
    }

    if (Number.isInteger(row.away_team_id) && (!selected || selected.has(row.away_team_id as number))) {
      teams.set(row.away_team_id as number, row.away_team_name ?? null);
    }
  }

  return [...teams.entries()]
    .map(([team_id, team_name]) => ({ team_id, team_name }))
    .sort((first, second) => first.team_id - second.team_id);
}

function hasApiErrors(errors: unknown): boolean {
  if (!errors) return false;
  if (Array.isArray(errors)) return errors.length > 0;
  if (typeof errors === 'object') return Object.keys(errors as Record<string, unknown>).length > 0;
  return true;
}

async function fetchSquad(teamId: number, apiFootballKey: string): Promise<ApiFootballSquad> {
  const url = new URL('/players/squads', API_FOOTBALL_BASE_URL);
  url.searchParams.set('team', String(teamId));

  const response = await fetch(url, {
    headers: {
      'x-apisports-key': apiFootballKey,
    },
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`API-Football squads HTTP ${response.status}: ${body}`);
  }

  const payload = (await response.json()) as ApiFootballSquadsResponse;

  if (hasApiErrors(payload.errors)) {
    throw new Error(`API-Football squads returned errors: ${JSON.stringify(payload.errors)}`);
  }

  return payload.response?.[0] ?? {};
}

function mapPlayers(squad: ApiFootballSquad, fallbackTeam: TeamSyncTarget): CupTeamPlayerUpsert[] {
  const teamId = squad.team?.id ?? fallbackTeam.team_id;
  const teamName = squad.team?.name ?? fallbackTeam.team_name;

  return (squad.players ?? []).flatMap((player) => {
    if (!Number.isInteger(player.id) || !player.name?.trim()) return [];

    return [{
      team_id: teamId,
      team_name: teamName,
      player_id: player.id as number,
      player_name: player.name.trim(),
      age: Number.isInteger(player.age) ? player.age as number : null,
      number: Number.isInteger(player.number) ? player.number as number : null,
      position: player.position ?? null,
      photo: player.photo ?? null,
      raw: player,
    }];
  });
}

Deno.serve(async (request) => {
  let supabase: ReturnType<typeof createClient> | null = null;
  let parsedRequest: Awaited<ReturnType<typeof parseRequest>> | null = null;

  try {
    if (request.method !== 'POST') {
      return jsonResponse({ ok: false, error: 'Method not allowed. Use POST.' }, 405);
    }

    const unauthorizedResponse = authorizeInternalRequest(request);
    if (unauthorizedResponse) {
      return unauthorizedResponse;
    }

    parsedRequest = await parseRequest(request);
    const supabaseUrl = requireEnv('SUPABASE_URL');
    const serviceRoleKey = requireEnv('SUPABASE_SERVICE_ROLE_KEY');
    const apiFootballKey = requireEnv('API_FOOTBALL_KEY');

    supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false },
    });

    const { data: matchRows, error: matchRowsError } = await supabase
      .from('cup_matches')
      .select('home_team_id,home_team_name,away_team_id,away_team_name')
      .eq('league_id', parsedRequest.league)
      .eq('season', parsedRequest.season);

    if (matchRowsError) {
      throw matchRowsError;
    }

    const targets = getTeamTargets((matchRows ?? []) as CupMatchTeamRow[], parsedRequest.team_ids);
    const synced: TeamSyncResult[] = [];
    const failed: TeamSyncFailure[] = [];
    let playersReceived = 0;
    let playersUpserted = 0;

    for (const target of targets) {
      try {
        const squad = await fetchSquad(target.team_id, apiFootballKey);
        const rows = mapPlayers(squad, target);
        playersReceived += squad.players?.length ?? 0;

        if (rows.length > 0) {
          const { error: upsertError } = await supabase
            .from('cup_team_players')
            .upsert(rows, { onConflict: 'team_id,player_id' });

          if (upsertError) {
            throw upsertError;
          }
        }

        playersUpserted += rows.length;
        synced.push({
          team_id: target.team_id,
          team_name: squad.team?.name ?? target.team_name,
          players_received: squad.players?.length ?? 0,
          players_upserted: rows.length,
        });
      } catch (error) {
        failed.push({
          team_id: target.team_id,
          team_name: target.team_name,
          error: getErrorMessage(error),
        });
      }
    }

    const status = failed.length > 0 ? 'partial_success' : 'success';
    const message = `Synced ${playersUpserted} players for ${synced.length}/${targets.length} teams.`;
    const metadata = {
      league: parsedRequest.league,
      season: parsedRequest.season,
      teams_requested: targets.length,
      teams_synced: synced.length,
      teams_failed: failed.length,
      players_received: playersReceived,
      players_upserted: playersUpserted,
      api_requests_total: targets.length,
      synced,
      failed,
    };

    const { error: logError } = await supabase.from('cup_sync_logs').insert({
      source: 'api-football-squads',
      status,
      message,
      metadata,
    });

    if (logError) {
      throw logError;
    }

    return jsonResponse({
      ok: failed.length === 0,
      ...metadata,
    });
  } catch (error) {
    const message = getErrorMessage(error);
    console.error('[sync-cup-squads] failed:', error);

    if (supabase) {
      const { error: logError } = await supabase.from('cup_sync_logs').insert({
        source: 'api-football-squads',
        status: 'error',
        message,
        metadata: parsedRequest ?? {},
      });

      if (logError) {
        console.error('[sync-cup-squads] error log insert failed:', logError);
      }
    }

    return jsonResponse({ ok: false, error: message }, 500);
  }
});
