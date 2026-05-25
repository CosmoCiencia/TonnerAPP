import { requireSupabase } from '../../../lib/supabase';
import { getOutcomeScore, type PredictionOutcome } from './predictionOutcome';
import type { Match, MatchWithPrediction, PointEntry, Prediction, RankingRow } from './types';

type PredictionRow = {
  id: string;
  user_id: string;
  match_id: string;
  prediction_result?: PredictionOutcome | null;
  predicted_home: number;
  predicted_away: number;
};

type PointRow = {
  id: string;
  user_id: string;
  match_id: string;
  points_awarded: number;
};

type RankingRowResponse = RankingRow & {
  display_name?: string | null;
};

function toPrediction(row: PredictionRow): Prediction {
  return {
    id: row.id,
    user_id: row.user_id,
    match_id: row.match_id,
    prediction_result:
      row.prediction_result ?? (
        row.predicted_home > row.predicted_away ? 'home' : row.predicted_home < row.predicted_away ? 'away' : 'draw'
      ),
    predicted_home: row.predicted_home,
    predicted_away: row.predicted_away,
  };
}

function toPoint(row: PointRow): PointEntry {
  return {
    id: row.id,
    user_id: row.user_id,
    match_id: row.match_id,
    points_awarded: row.points_awarded,
  };
}

function isMissingPredictionResultColumn(error: { message?: string; details?: string; hint?: string } | null) {
  const text = `${error?.message ?? ''} ${error?.details ?? ''} ${error?.hint ?? ''}`.toLowerCase();
  return text.includes('prediction_result');
}

export async function fetchPredictions(userId: string): Promise<Prediction[]> {
  const supabase = requireSupabase();
  const response = await supabase
    .from('cup_predictions')
    .select('id,user_id,match_id,prediction_result,predicted_home,predicted_away')
    .eq('user_id', userId);

  if (response.error) {
    if (isMissingPredictionResultColumn(response.error)) {
      const legacyResponse = await supabase
        .from('cup_predictions')
        .select('id,user_id,match_id,predicted_home,predicted_away')
        .eq('user_id', userId);

      if (legacyResponse.error) {
        throw new Error(`No se pudieron cargar tus pronósticos: ${legacyResponse.error.message}`);
      }

      return ((legacyResponse.data ?? []) as PredictionRow[]).map(toPrediction);
    }

    throw new Error(`No se pudieron cargar tus pronósticos: ${response.error.message}`);
  }

  return ((response.data ?? []) as PredictionRow[]).map(toPrediction);
}

export async function fetchPoints(userId: string): Promise<PointEntry[]> {
  const supabase = requireSupabase();
  const { data, error } = await supabase
    .from('cup_points')
    .select('id,user_id,match_id,points_awarded')
    .eq('user_id', userId);

  if (error) {
    throw new Error(`No se pudieron cargar tus puntos: ${error.message}`);
  }

  return ((data ?? []) as PointRow[]).map(toPoint);
}

export async function fetchRanking(): Promise<RankingRow[]> {
  const supabase = requireSupabase();
  const { data, error } = await supabase
    .from('cup_ranking_view')
    .select('position,user_id,display_name,total_points,exact_hits')
    .order('position', { ascending: true });

  if (error) {
    throw new Error(`No se pudo cargar el ranking: ${error.message}`);
  }

  return ((data ?? []) as RankingRowResponse[]).map((row) => ({
    position: row.position,
    user_id: row.user_id,
    display_name: row.display_name ?? row.user_id,
    total_points: row.total_points,
    exact_hits: row.exact_hits,
  }));
}

export async function upsertPrediction(
  user_id: string,
  match_id: string,
  prediction_result: PredictionOutcome,
): Promise<Prediction> {
  const supabase = requireSupabase();
  const score = getOutcomeScore(prediction_result);
  const response = await supabase
    .from('cup_predictions')
    .upsert(
      {
        user_id,
        match_id,
        prediction_result,
        predicted_home: score.home,
        predicted_away: score.away,
      },
      { onConflict: 'user_id,match_id' },
    )
    .select('id,user_id,match_id,prediction_result,predicted_home,predicted_away')
    .single();

  if (response.error) {
    if (isMissingPredictionResultColumn(response.error)) {
      const legacyResponse = await supabase
        .from('cup_predictions')
        .upsert(
          {
            user_id,
            match_id,
            predicted_home: score.home,
            predicted_away: score.away,
          },
          { onConflict: 'user_id,match_id' },
        )
        .select('id,user_id,match_id,predicted_home,predicted_away')
        .single();

      if (legacyResponse.error) {
        throw new Error(
          `No se pudo guardar el pronóstico. Detalle: ${legacyResponse.error.message}`,
        );
      }

      return toPrediction({
        ...(legacyResponse.data as PredictionRow),
        prediction_result,
      });
    }

    throw new Error(
      `No se pudo guardar el pronóstico. Detalle: ${response.error.message}`,
    );
  }

  return toPrediction(response.data as PredictionRow);
}

export function getUserMatches(
  matches: Match[],
  predictions: Prediction[],
  points: PointEntry[],
  user_id: string,
): MatchWithPrediction[] {
  const predictionsByMatch = new Map(
    predictions
      .filter((prediction) => prediction.user_id === user_id)
      .map((prediction) => [prediction.match_id, prediction]),
  );
  const pointsByMatch = new Map(
    points.filter((entry) => entry.user_id === user_id).map((entry) => [entry.match_id, entry]),
  );

  return matches.map((match) => ({
    match,
    prediction: predictionsByMatch.get(match.id),
    points: pointsByMatch.get(match.id),
  }));
}
