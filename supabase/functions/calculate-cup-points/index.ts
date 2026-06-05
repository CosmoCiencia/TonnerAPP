import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.87.1';

type CupMatch = {
  id: string;
  score_home: number | null;
  score_away: number | null;
  raw: unknown;
};

type CupPrediction = {
  user_id: string;
  match_id: string;
  prediction_result: MatchResult;
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
const POINTS_FOR_RESULT_HIT = 3;
const POINTS_FOR_EXACT_HIT = 5;
const POINTS_FOR_SCORER_HIT = 2;

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
    return jsonResponse({ ok: false, error: 'Unauthorized points calculation request.' }, 401);
  }

  return null;
}

type MatchResult = 'home' | 'draw' | 'away';

type RawGoalEvent = {
  type?: string | null;
  detail?: string | null;
  player?: {
    id?: number | null;
  } | null;
};

function getScoreResult(home: number, away: number): MatchResult {
  if (home > away) return 'home';
  if (home < away) return 'away';
  return 'draw';
}

function getActualResult(match: CupMatch): MatchResult {
  const home = match.score_home ?? 0;
  const away = match.score_away ?? 0;

  return getScoreResult(home, away);
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

function getScorerHit(match: CupMatch, prediction: CupPrediction): boolean {
  if (!prediction.predicted_scorer_player_id) return false;

  return getRawGoalEvents(match.raw).some(
    (event) => event.player?.id === prediction.predicted_scorer_player_id,
  );
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

    const { data: matchesData, error: matchesError } = await supabase
      .from('cup_matches')
      .select('id,score_home,score_away,raw')
      .in('status_short', FINISHED_STATUSES)
      .not('score_home', 'is', null)
      .not('score_away', 'is', null);

    if (matchesError) {
      throw matchesError;
    }

    const matches = (matchesData ?? []) as CupMatch[];
    const matchIds = matches.map((match) => match.id);

    if (matchIds.length === 0) {
      return jsonResponse({
        ok: true,
        finished_matches: 0,
        predictions_scored: 0,
        points_upserted: 0,
      });
    }

    const { data: predictionsData, error: predictionsError } = await supabase
      .from('cup_predictions')
      .select('user_id,match_id,prediction_result,predicted_home,predicted_away,predicted_scorer_player_id')
      .in('match_id', matchIds);

    if (predictionsError) {
      throw predictionsError;
    }

    const matchesById = new Map(matches.map((match) => [match.id, match]));
    const predictions = (predictionsData ?? []) as CupPrediction[];
    const calculatedAt = new Date().toISOString();

    const rows: CupPointUpsert[] = predictions.flatMap((prediction) => {
      const match = matchesById.get(prediction.match_id);
      if (!match) return [];

      const resultHit = prediction.prediction_result === getActualResult(match);
      const exactHit = prediction.predicted_home === match.score_home
        && prediction.predicted_away === match.score_away;
      const scorerHit = getScorerHit(match, prediction);
      const pointsAwarded = (resultHit ? POINTS_FOR_RESULT_HIT : 0)
        + (exactHit ? POINTS_FOR_EXACT_HIT : 0)
        + (scorerHit ? POINTS_FOR_SCORER_HIT : 0);

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
      const { error: pointsError } = await supabase
        .from('cup_points')
        .upsert(rows, { onConflict: 'user_id,match_id' });

      if (pointsError) {
        throw pointsError;
      }
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
    });
  } catch (error) {
    const message = getErrorMessage(error);
    console.error('[calculate-cup-points] failed:', error);
    return jsonResponse({ ok: false, error: message }, 500);
  }
});
