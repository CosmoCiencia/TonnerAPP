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

export async function fetchPredictions(userId: string): Promise<Prediction[]> {
  const supabase = requireSupabase();
  const { data, error } = await supabase
    .from('cup_predictions')
    .select('id,user_id,match_id,prediction_result,predicted_home,predicted_away')
    .eq('user_id', userId);

  if (error) {
    throw new Error(`No se pudieron cargar tus pronósticos: ${error.message}`);
  }

  return ((data ?? []) as PredictionRow[]).map(toPrediction);
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
    .select('position,user_id,display_name,total_points,exact_hits,prediction_count')
    .order('position', { ascending: true });

  if (error) {
    throw new Error(`No se pudo cargar el ranking: ${error.message}`);
  }

  return ((data ?? []) as RankingRowResponse[]).map((row) => ({
    position: row.position,
    user_id: row.user_id,
    display_name: row.display_name ?? 'Participante',
    total_points: row.total_points,
    exact_hits: row.exact_hits,
    prediction_count: row.prediction_count ?? 0,
  }));
}

export async function upsertPrediction(
  user_id: string,
  match_id: string,
  prediction_result: PredictionOutcome,
): Promise<Prediction> {
  const supabase = requireSupabase();
  const score = getOutcomeScore(prediction_result);
  const { data, error } = await supabase
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

  if (error) {
    throw new Error(
      `No se pudo guardar el pronóstico. Detalle: ${error.message}`,
    );
  }

  return toPrediction(data as PredictionRow);
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
