import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.87.1';

type CupMatch = {
  id: string;
  api_fixture_id: number | null;
  status_short: string;
  stage: string | null;
  round: string | null;
  score_home: number | null;
  score_away: number | null;
  raw: unknown;
};

type CupPrediction = {
  user_id: string;
  match_id: string;
  prediction_result: MatchResult;
  predicted_qualifier: 'home' | 'away' | null;
  predicted_home: number;
  predicted_away: number;
  predicted_scorer_player_id: number | null;
};

type CupPointUpsert = {
  user_id: string;
  match_id: string;
  points_awarded: number;
  exact_hit: boolean;
  result_hit: boolean;
  scorer_hit: boolean;
  calculated_at: string;
};

const FINISHED_STATUSES = ['FT', 'AET', 'PEN'];
const GROUP_STAGE_POINTS = {
  resultHit: 3,
  exactHit: 5,
  scorerHit: 2,
} as const;
const KNOCKOUT_STAGE_POINTS = {
  resultHit: 4,
  exactHit: 6,
  scorerHit: 3,
} as const;
const OCTAVOS_STAGE_POINTS = {
  resultHit: 6,
  exactHit: 8,
  scorerHit: 4,
} as const;
const QUARTER_FINAL_STAGE_POINTS = {
  resultHit: 8,
  exactHit: 10,
  scorerHit: 5,
} as const;
const SEMI_FINAL_STAGE_POINTS = {
  resultHit: 12,
  exactHit: 15,
  scorerHit: 10,
} as const;
const FINAL_STAGE_POINTS = {
  resultHit: 16,
  exactHit: 20,
  scorerHit: 12,
} as const;
const THIRD_PLACE_STAGE_POINTS = {
  resultHit: 12,
  exactHit: 15,
  scorerHit: 10,
} as const;
const API_FOOTBALL_BASE_URL = 'https://v3.football.api-sports.io';
const PAGE_SIZE = 1000;

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

function getOptionalEnv(name: string): string | null {
  return Deno.env.get(name)?.trim() || null;
}

function authorizeInternalRequest(request: Request): Response | null {
  const expectedSecret = requireEnv('SYNC_CUP_SECRET');
  const receivedSecret = request.headers.get('x-tonner-sync-secret')?.trim();

  if (!receivedSecret || receivedSecret !== expectedSecret) {
    return jsonResponse({ ok: false, error: 'Unauthorized points calculation request.' }, 401);
  }

  return null;
}

type MatchResult = 'home' | 'draw' | 'away';

type RawGoalEvent = {
  time?: {
    elapsed?: number | null;
    extra?: number | null;
  } | null;
  team?: {
    id?: number | null;
    name?: string | null;
  } | null;
  type?: string | null;
  detail?: string | null;
  player?: {
    id?: number | null;
    name?: string | null;
  } | null;
  assist?: {
    id?: number | null;
    name?: string | null;
  } | null;
  comments?: string | null;
};

type ApiFootballEventsResponse = {
  errors?: unknown;
  response?: RawGoalEvent[];
};

function getScoreResult(home: number, away: number): MatchResult {
  if (home > away) return 'home';
  if (home < away) return 'away';
  return 'draw';
}

function getPenaltyWinnerResult(match: CupMatch): MatchResult | null {
  if (match.status_short !== 'PEN' || !isRecord(match.raw)) return null;

  const teams = match.raw.teams;
  if (isRecord(teams)) {
    const home = teams.home;
    const away = teams.away;

    if (isRecord(home) && home.winner === true) return 'home';
    if (isRecord(away) && away.winner === true) return 'away';
  }

  const score = match.raw.score;
  const penalty = isRecord(score) ? score.penalty : null;

  if (isRecord(penalty)) {
    const home = penalty.home;
    const away = penalty.away;

    if (typeof home === 'number' && typeof away === 'number' && home !== away) {
      return getScoreResult(home, away);
    }
  }

  return null;
}

function getActualResult(match: CupMatch): MatchResult {
  const penaltyWinner = getPenaltyWinnerResult(match);
  if (penaltyWinner) return penaltyWinner;

  const home = match.score_home ?? 0;
  const away = match.score_away ?? 0;

  return getScoreResult(home, away);
}

function getPointsRule(match: CupMatch) {
  const phase = `${match.stage ?? ''} ${match.round ?? ''}`.toLowerCase();

  if (phase.includes('group') || phase.includes('fase de grupos')) {
    return GROUP_STAGE_POINTS;
  }

  const isThirdPlaceMatch = [
    'third place',
    '3rd place',
    'tercer puesto',
    'tercero',
    'puestos 3 y 4',
    'puesto 3',
  ].some((stageName) => phase.includes(stageName));

  if (isThirdPlaceMatch) {
    return THIRD_PLACE_STAGE_POINTS;
  }

  if (phase.includes('semi')) {
    return SEMI_FINAL_STAGE_POINTS;
  }

  if (phase.includes('quarter') || phase.includes('cuartos')) {
    return QUARTER_FINAL_STAGE_POINTS;
  }

  if (phase.includes('final')) {
    return FINAL_STAGE_POINTS;
  }

  if (phase.includes('octavos') || phase.includes('round of 16')) {
    return OCTAVOS_STAGE_POINTS;
  }

  const isKnockoutStage = [
    'round of',
    'knockout',
    'dieciseisavos',
  ].some((stageName) => phase.includes(stageName));

  return isKnockoutStage ? KNOCKOUT_STAGE_POINTS : GROUP_STAGE_POINTS;
}

function getPredictedResult(match: CupMatch, prediction: CupPrediction): MatchResult {
  const isKnockoutStage = getPointsRule(match) !== GROUP_STAGE_POINTS;
  return isKnockoutStage
    ? prediction.predicted_qualifier ?? prediction.prediction_result
    : prediction.prediction_result;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function getRawGoalEvents(raw: unknown): RawGoalEvent[] {
  if (!isRecord(raw) || !Array.isArray(raw.events)) return [];

  return raw.events.filter((event): event is RawGoalEvent => {
    if (!isRecord(event)) return false;
    return event.type === 'Goal'
      && event.detail !== 'Missed Penalty'
      && event.detail !== 'Own Goal';
  });
}

async function fetchApiFootballGoalEvents(
  apiFixtureId: number,
  apiFootballKey: string,
): Promise<RawGoalEvent[]> {
  const url = new URL('/fixtures/events', API_FOOTBALL_BASE_URL);
  url.searchParams.set('fixture', String(apiFixtureId));

  try {
    const response = await fetch(url, {
      headers: {
        'x-apisports-key': apiFootballKey,
      },
    });

    if (!response.ok) {
      const body = await response.text();
      console.error(`[calculate-cup-points] fixture events HTTP ${response.status}: ${body}`);
      return [];
    }

    const payload = (await response.json()) as ApiFootballEventsResponse;
    const apiErrors = payload.errors;

    if (
      apiErrors &&
      ((Array.isArray(apiErrors) && apiErrors.length > 0) ||
        (!Array.isArray(apiErrors) && Object.keys(apiErrors as Record<string, unknown>).length > 0))
    ) {
      console.error(`[calculate-cup-points] fixture events returned errors: ${JSON.stringify(apiErrors)}`);
      return [];
    }

    return (payload.response ?? []).filter((event) => event.type === 'Goal'
      && event.detail !== 'Missed Penalty'
      && event.detail !== 'Own Goal');
  } catch (error) {
    console.error('[calculate-cup-points] fixture events fetch failed:', error);
    return [];
  }
}

function matchHasGoals(match: CupMatch): boolean {
  return (match.score_home ?? 0) + (match.score_away ?? 0) > 0;
}

function shouldRefreshGoalEvents(match: CupMatch, predictions: CupPrediction[]): boolean {
  return Boolean(
    match.api_fixture_id &&
    matchHasGoals(match) &&
    getRawGoalEvents(match.raw).length === 0 &&
    predictions.some((prediction) => (
      prediction.match_id === match.id && prediction.predicted_scorer_player_id
    )),
  );
}

async function refreshMissingGoalEvents(
  supabase: ReturnType<typeof createClient>,
  matches: CupMatch[],
  predictions: CupPrediction[],
  apiFootballKey: string | null,
): Promise<{ matches: CupMatch[]; eventRequests: number }> {
  if (!apiFootballKey) {
    return { matches, eventRequests: 0 };
  }

  const refreshedMatches: CupMatch[] = [];
  let eventRequests = 0;

  for (const match of matches) {
    if (!shouldRefreshGoalEvents(match, predictions)) {
      refreshedMatches.push(match);
      continue;
    }

    eventRequests += 1;
    const events = await fetchApiFootballGoalEvents(match.api_fixture_id as number, apiFootballKey);
    const raw = isRecord(match.raw) ? { ...match.raw, events } : { events };
    const refreshedMatch = { ...match, raw };
    refreshedMatches.push(refreshedMatch);

    const { error } = await supabase
      .from('cup_matches')
      .update({ raw })
      .eq('id', match.id);

    if (error) {
      console.error(`[calculate-cup-points] could not persist goal events for match ${match.id}:`, error);
    }
  }

  return { matches: refreshedMatches, eventRequests };
}

function getScorerHit(match: CupMatch, prediction: CupPrediction): boolean {
  if (!prediction.predicted_scorer_player_id) return false;

  return getRawGoalEvents(match.raw).some(
    (event) => event.player?.id === prediction.predicted_scorer_player_id,
  );
}

async function fetchFinishedMatches(
  supabase: ReturnType<typeof createClient>,
): Promise<CupMatch[]> {
  const rows: CupMatch[] = [];

  for (let from = 0; ; from += PAGE_SIZE) {
    const to = from + PAGE_SIZE - 1;
    const { data, error } = await supabase
      .from('cup_matches')
      .select('id,api_fixture_id,status_short,stage,round,score_home,score_away,raw')
      .in('status_short', FINISHED_STATUSES)
      .not('score_home', 'is', null)
      .not('score_away', 'is', null)
      .order('id', { ascending: true })
      .range(from, to);

    if (error) {
      throw error;
    }

    const page = (data ?? []) as CupMatch[];
    rows.push(...page);

    if (page.length < PAGE_SIZE) {
      return rows;
    }
  }
}

async function fetchPredictionsForMatches(
  supabase: ReturnType<typeof createClient>,
  matchIds: string[],
): Promise<CupPrediction[]> {
  const rows: CupPrediction[] = [];

  for (let from = 0; ; from += PAGE_SIZE) {
    const to = from + PAGE_SIZE - 1;
    const { data, error } = await supabase
      .from('cup_predictions')
      .select('user_id,match_id,prediction_result,predicted_qualifier,predicted_home,predicted_away,predicted_scorer_player_id')
      .in('match_id', matchIds)
      .order('match_id', { ascending: true })
      .order('user_id', { ascending: true })
      .range(from, to);

    if (error) {
      throw error;
    }

    const page = (data ?? []) as CupPrediction[];
    rows.push(...page);

    if (page.length < PAGE_SIZE) {
      return rows;
    }
  }
}

async function upsertPointRows(
  supabase: ReturnType<typeof createClient>,
  rows: CupPointUpsert[],
): Promise<void> {
  for (let index = 0; index < rows.length; index += PAGE_SIZE) {
    const batch = rows.slice(index, index + PAGE_SIZE);
    const { error } = await supabase
      .from('cup_points')
      .upsert(batch, { onConflict: 'user_id,match_id' });

    if (error) {
      throw error;
    }
  }
}

Deno.serve(async (request) => {
  try {
    if (request.method !== 'POST') {
      return jsonResponse({ ok: false, error: 'Method not allowed. Use POST.' }, 405);
    }

    const unauthorizedResponse = authorizeInternalRequest(request);
    if (unauthorizedResponse) {
      return unauthorizedResponse;
    }

    const supabaseUrl = requireEnv('SUPABASE_URL');
    const serviceRoleKey = requireEnv('SUPABASE_SERVICE_ROLE_KEY');
    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false },
    });

    const matches = await fetchFinishedMatches(supabase);
    const matchIds = matches.map((match) => match.id);

    if (matchIds.length === 0) {
      return jsonResponse({
        ok: true,
        finished_matches: 0,
        predictions_scored: 0,
        points_upserted: 0,
      });
    }

    const predictions = await fetchPredictionsForMatches(supabase, matchIds);
    const goalEventRefresh = await refreshMissingGoalEvents(
      supabase,
      matches,
      predictions,
      getOptionalEnv('API_FOOTBALL_KEY'),
    );
    const matchesById = new Map(goalEventRefresh.matches.map((match) => [match.id, match]));
    const calculatedAt = new Date().toISOString();

    const rows: CupPointUpsert[] = predictions.flatMap((prediction) => {
      const match = matchesById.get(prediction.match_id);
      if (!match) return [];

      const resultHit = getPredictedResult(match, prediction) === getActualResult(match);
      const exactHit = prediction.predicted_home === match.score_home
        && prediction.predicted_away === match.score_away;
      const scorerHit = getScorerHit(match, prediction);
      const pointsRule = getPointsRule(match);
      const pointsAwarded = (resultHit ? pointsRule.resultHit : 0)
        + (exactHit ? pointsRule.exactHit : 0)
        + (scorerHit ? pointsRule.scorerHit : 0);

      return [
        {
          user_id: prediction.user_id,
          match_id: prediction.match_id,
          points_awarded: pointsAwarded,
          exact_hit: exactHit,
          result_hit: resultHit,
          scorer_hit: scorerHit,
          calculated_at: calculatedAt,
        },
      ];
    });

    if (rows.length > 0) {
      await upsertPointRows(supabase, rows);
    }

    const { error: logError } = await supabase.from('cup_sync_logs').insert({
      source: 'tonnercup-points',
      status: 'success',
      message: `Calculated ${rows.length} predictions for ${matches.length} finished matches.`,
      metadata: {
        finished_matches: matches.length,
        predictions_scored: predictions.length,
        points_upserted: rows.length,
        scorer_hits: rows.filter((row) => row.scorer_hit).length,
        event_requests: goalEventRefresh.eventRequests,
      },
    });

    if (logError) {
      throw logError;
    }

    return jsonResponse({
      ok: true,
      finished_matches: matches.length,
      predictions_scored: predictions.length,
      points_upserted: rows.length,
      scorer_hits: rows.filter((row) => row.scorer_hit).length,
      event_requests: goalEventRefresh.eventRequests,
    });
  } catch (error) {
    const message = getErrorMessage(error);
    console.error('[calculate-cup-points] failed:', error);
    return jsonResponse({ ok: false, error: message }, 500);
  }
});
