import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.87.1';

const API_FOOTBALL_BASE_URL = 'https://v3.football.api-sports.io';
const WORLD_CUP_LEAGUE_ID = 1;
const WORLD_CUP_SEASON = 2026;
const ALLOWED_LEAGUE_IDS = new Set([WORLD_CUP_LEAGUE_ID, 13, 11]);

type SyncTarget = {
  league: number;
  season: number;
  next?: number;
  status?: string;
};

type SyncRequestBody = {
  targets?: SyncTarget[];
  refreshExisting?: boolean;
};

type ApiFootballFixture = {
  fixture?: {
    id?: number;
    date?: string;
    venue?: {
      name?: string | null;
      city?: string | null;
    } | null;
    status?: {
      long?: string | null;
      short?: string | null;
      elapsed?: number | null;
      extra?: number | null;
    } | null;
  };
  league?: {
    id?: number;
    season?: number;
    round?: string | null;
  };
  teams?: {
    home?: {
      id?: number | null;
      name?: string | null;
      logo?: string | null;
    } | null;
    away?: {
      id?: number | null;
      name?: string | null;
      logo?: string | null;
    } | null;
  };
  goals?: {
    home?: number | null;
    away?: number | null;
  } | null;
};

type ApiFootballResponse = {
  errors?: unknown;
  response?: ApiFootballFixture[];
};

type CupMatchUpsert = {
  id: string;
  api_fixture_id: number;
  league_id: number;
  season: number;
  round: string | null;
  stage: string | null;
  group_name: string | null;
  date: string;
  status_short: string;
  status_long: string;
  elapsed_minutes: number | null;
  extra_minutes: number | null;
  home_team_id: number | null;
  home_team_name: string;
  home_team_logo: string | null;
  away_team_id: number | null;
  away_team_name: string;
  away_team_logo: string | null;
  venue_name: string | null;
  venue_city: string | null;
  score_home: number | null;
  score_away: number | null;
  raw: ApiFootballFixture;
  updated_at: string;
};

type ExistingCupMatch = {
  api_fixture_id: number | null;
  league_id: number;
};

type ParsedSyncRequest = {
  targets: SyncTarget[];
  refreshExisting: boolean;
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

async function parseSyncRequest(request: Request): Promise<ParsedSyncRequest> {
  let body: SyncRequestBody | null = null;

  try {
    body = await request.json();
  } catch {
    body = null;
  }

  const targets = body?.targets?.length
    ? body.targets
    : [{ league: WORLD_CUP_LEAGUE_ID, season: WORLD_CUP_SEASON }];

  return {
    targets: targets.map((target) => {
    const league = Number(target.league);
    const season = Number(target.season);
    const next = target.next === undefined ? undefined : Number(target.next);
    const status = target.status?.trim();

    if (!Number.isInteger(league) || !ALLOWED_LEAGUE_IDS.has(league)) {
      throw new Error(`Unsupported league id for sync: ${target.league}`);
    }

    if (!Number.isInteger(season) || season < 2000 || season > 2100) {
      throw new Error(`Invalid season for sync: ${target.season}`);
    }

    if (next !== undefined && (!Number.isInteger(next) || next < 1 || next > 99)) {
      throw new Error(`Invalid next value for sync: ${target.next}`);
    }

    return { league, season, next, status };
    }),
    refreshExisting: body?.refreshExisting ?? false,
  };
}

function authorizeInternalRequest(request: Request): Response | null {
  const expectedSecret = requireEnv('SYNC_CUP_SECRET');
  const receivedSecret = request.headers.get('x-tonner-sync-secret')?.trim();
  const authorized = Boolean(receivedSecret && receivedSecret === expectedSecret);

  if (!authorized) {
    return jsonResponse({ ok: false, error: 'Unauthorized sync request.' }, 401);
  }

  return null;
}

function normalizeStage(round: string | null): string | null {
  if (!round) return null;
  const lowerRound = round.toLowerCase();

  if (lowerRound.includes('group')) return 'Fase de grupos';
  if (lowerRound.includes('round of 32')) return 'Dieciseisavos';
  if (lowerRound.includes('round of 16')) return 'Octavos';
  if (lowerRound.includes('quarter')) return 'Cuartos';
  if (lowerRound.includes('semi')) return 'Semifinal';
  if (lowerRound.includes('final')) return 'Final';

  return round;
}

function extractGroupName(round: string | null): string | null {
  if (!round) return null;
  const groupMatch = round.match(/group\s+([a-l])/i);
  return groupMatch?.[1]?.toUpperCase() ?? null;
}

function mapFixture(fixture: ApiFootballFixture): CupMatchUpsert | null {
  const apiFixtureId = fixture.fixture?.id;
  const date = fixture.fixture?.date;

  if (!apiFixtureId || !date) {
    return null;
  }

  const round = fixture.league?.round ?? null;
  const now = new Date().toISOString();

  return {
    id: String(apiFixtureId),
    api_fixture_id: apiFixtureId,
    league_id: fixture.league?.id ?? WORLD_CUP_LEAGUE_ID,
    season: fixture.league?.season ?? WORLD_CUP_SEASON,
    round,
    stage: normalizeStage(round),
    group_name: extractGroupName(round),
    date,
    status_short: fixture.fixture?.status?.short ?? 'NS',
    status_long: fixture.fixture?.status?.long ?? 'Not Started',
    elapsed_minutes: fixture.fixture?.status?.elapsed ?? null,
    extra_minutes: fixture.fixture?.status?.extra ?? null,
    home_team_id: fixture.teams?.home?.id ?? null,
    home_team_name: fixture.teams?.home?.name ?? 'Por definir',
    home_team_logo: fixture.teams?.home?.logo ?? null,
    away_team_id: fixture.teams?.away?.id ?? null,
    away_team_name: fixture.teams?.away?.name ?? 'Por definir',
    away_team_logo: fixture.teams?.away?.logo ?? null,
    venue_name: fixture.fixture?.venue?.name ?? null,
    venue_city: fixture.fixture?.venue?.city ?? null,
    score_home: fixture.goals?.home ?? null,
    score_away: fixture.goals?.away ?? null,
    raw: fixture,
    updated_at: now,
  };
}

async function fetchApiFootballFixtures(url: URL, apiFootballKey: string): Promise<ApiFootballFixture[]> {
  const response = await fetch(url, {
    headers: {
      'x-apisports-key': apiFootballKey,
    },
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`API-Football HTTP ${response.status}: ${body}`);
  }

  const payload = (await response.json()) as ApiFootballResponse;
  const apiErrors = payload.errors;

  if (
    apiErrors &&
    ((Array.isArray(apiErrors) && apiErrors.length > 0) ||
      (!Array.isArray(apiErrors) && Object.keys(apiErrors as Record<string, unknown>).length > 0))
  ) {
    throw new Error(`API-Football returned errors: ${JSON.stringify(apiErrors)}`);
  }

  return payload.response ?? [];
}

Deno.serve(async (request) => {
  let supabase: ReturnType<typeof createClient> | null = null;
  let targets: SyncTarget[] | null = null;
  let refreshExisting = false;

  try {
    if (request.method !== 'POST') {
      return jsonResponse({ ok: false, error: 'Method not allowed. Use POST.' }, 405);
    }

    const unauthorizedResponse = authorizeInternalRequest(request);
    if (unauthorizedResponse) {
      return unauthorizedResponse;
    }

    const parsedRequest = await parseSyncRequest(request);
    targets = parsedRequest.targets;
    refreshExisting = parsedRequest.refreshExisting;
    const supabaseUrl = requireEnv('SUPABASE_URL');
    const serviceRoleKey = requireEnv('SUPABASE_SERVICE_ROLE_KEY');
    const apiFootballKey = requireEnv('API_FOOTBALL_KEY');

    supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false },
    });

    const receivedByTarget: Array<SyncTarget & { received: number; upserted: number }> = [];
    const refreshedExisting: Array<{ api_fixture_id: number; received: number; upserted: number }> = [];
    const rows: CupMatchUpsert[] = [];

    for (const target of targets) {
      const url = new URL('/fixtures', API_FOOTBALL_BASE_URL);
      url.searchParams.set('league', String(target.league));
      url.searchParams.set('season', String(target.season));

      if (target.next !== undefined) {
        url.searchParams.set('next', String(target.next));
      }

      if (target.status) {
        url.searchParams.set('status', target.status);
      }

      const fixtures = await fetchApiFootballFixtures(url, apiFootballKey);
      const targetRows = fixtures.map(mapFixture).filter((row): row is CupMatchUpsert => Boolean(row));
      rows.push(...targetRows);
      receivedByTarget.push({
        ...target,
        received: fixtures.length,
        upserted: targetRows.length,
      });
    }

    if (refreshExisting) {
      const targetLeagueIds = [...new Set(targets.map((target) => target.league))];
      const { data: existingMatches, error: existingMatchesError } = await supabase
        .from('cup_matches')
        .select('api_fixture_id,league_id')
        .in('league_id', targetLeagueIds)
        .not('api_fixture_id', 'is', null);

      if (existingMatchesError) {
        throw existingMatchesError;
      }

      const existingFixtureIds = [
        ...new Set(
          ((existingMatches ?? []) as ExistingCupMatch[])
            .map((match) => match.api_fixture_id)
            .filter((apiFixtureId): apiFixtureId is number => Number.isInteger(apiFixtureId)),
        ),
      ];

      for (const apiFixtureId of existingFixtureIds) {
        const url = new URL('/fixtures', API_FOOTBALL_BASE_URL);
        url.searchParams.set('id', String(apiFixtureId));

        const fixtures = await fetchApiFootballFixtures(url, apiFootballKey);
        const fixtureRows = fixtures.map(mapFixture).filter((row): row is CupMatchUpsert => Boolean(row));
        rows.push(...fixtureRows);
        refreshedExisting.push({
          api_fixture_id: apiFixtureId,
          received: fixtures.length,
          upserted: fixtureRows.length,
        });
      }
    }

    const rowsByFixtureId = new Map(rows.map((row) => [row.api_fixture_id, row]));
    const dedupedRows = [...rowsByFixtureId.values()];

    if (dedupedRows.length > 0) {
      const { error } = await supabase
        .from('cup_matches')
        .upsert(dedupedRows, { onConflict: 'api_fixture_id' });

      if (error) {
        console.error('[sync-cup-fixtures] cup_matches upsert error:', error);
        throw error;
      }
    }

    const { error: logError } = await supabase.from('cup_sync_logs').insert({
      source: 'api-football',
      status: 'success',
      message: `Synced ${dedupedRows.length} fixtures.`,
      metadata: {
        targets: receivedByTarget,
        refreshed_existing: refreshedExisting,
        upserted: dedupedRows.length,
      },
    });

    if (logError) {
      console.error('[sync-cup-fixtures] success log insert error:', logError);
      throw logError;
    }

    return jsonResponse({
      ok: true,
      targets: receivedByTarget,
      refreshed_existing: refreshedExisting,
      upserted: dedupedRows.length,
    });
  } catch (error) {
    const message = getErrorMessage(error);
    console.error('[sync-cup-fixtures] sync failed:', error);

    if (supabase) {
      const { error: logError } = await supabase.from('cup_sync_logs').insert({
        source: 'api-football',
        status: 'error',
        message,
        metadata: {
          targets,
          refreshExisting,
        },
      });

      if (logError) {
        console.error('[sync-cup-fixtures] error log insert failed:', logError);
      }
    }

    return jsonResponse({ ok: false, error: message }, 500);
  }
});
