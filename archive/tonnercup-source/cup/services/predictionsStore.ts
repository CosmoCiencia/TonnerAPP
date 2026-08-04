import { requireSupabase } from '../../../lib/supabase';
import { getScoreOutcome, type PredictedQualifier, type PredictionOutcome } from './predictionOutcome';
import type { CupTeamPlayer, Match, MatchWithPrediction, PointEntry, Prediction, RankingRow } from './types';

type PredictionRow = {
  id: string;
  user_id: string;
  match_id: string;
  prediction_result?: PredictionOutcome | null;
  predicted_qualifier?: PredictedQualifier | null;
  predicted_home: number;
  predicted_away: number;
  predicted_scorer_player_id?: number | null;
  predicted_scorer_name?: string | null;
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
    predicted_qualifier: row.predicted_qualifier ?? null,
    predicted_home: row.predicted_home,
    predicted_away: row.predicted_away,
    predicted_scorer_player_id: row.predicted_scorer_player_id ?? null,
    predicted_scorer_name: row.predicted_scorer_name ?? null,
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
    .select('id,user_id,match_id,prediction_result,predicted_qualifier,predicted_home,predicted_away,predicted_scorer_player_id,predicted_scorer_name')
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

export async function fetchRanking(expectedUserId?: string): Promise<RankingRow[]> {
  const supabase = requireSupabase();
  const { data: sessionData, error: sessionError } = await supabase.auth.getSession();

  if (sessionError) {
    throw new Error(`No se pudo validar la sesión para cargar el ranking: ${sessionError.message}`);
  }

  const sessionUserId = sessionData.session?.user.id;

  if (!sessionData.session?.access_token || !sessionUserId) {
    throw new Error('No hay una sesión Supabase activa para cargar el ranking.');
  }

  if (expectedUserId && sessionUserId !== expectedUserId) {
    throw new Error('La sesión Supabase activa no coincide con el usuario actual del ranking.');
  }

  const { data, error } = await supabase
    .from('cup_ranking_view')
    .select('position,user_id,display_name,cup_user_type,total_points,exact_hits,prediction_count')
    .order('position', { ascending: true });

  if (error) {
    throw new Error(`No se pudo cargar el ranking: ${error.message}`);
  }

  return ((data ?? []) as RankingRowResponse[]).map((row) => ({
    position: row.position,
    user_id: row.user_id,
    display_name: row.display_name ?? 'Participante',
    cup_user_type: row.cup_user_type,
    total_points: row.total_points,
    exact_hits: row.exact_hits,
    prediction_count: row.prediction_count ?? 0,
  }));
}

export async function upsertPrediction(
  user_id: string,
  match_id: string,
  prediction_result: PredictionOutcome,
  predicted_home: number,
  predicted_away: number,
  predicted_scorer_player_id?: number | null,
  predicted_scorer_name?: string | null,
  predicted_qualifier?: PredictedQualifier | null,
): Promise<Prediction> {
  if (
    !Number.isInteger(predicted_home)
    || !Number.isInteger(predicted_away)
    || predicted_home < 0
    || predicted_away < 0
  ) {
    throw new Error('El marcador pronosticado debe usar números enteros mayores o iguales a cero.');
  }

  if (getScoreOutcome(predicted_home, predicted_away) !== prediction_result) {
    throw new Error('El marcador exacto debe coincidir con el resultado elegido.');
  }

  const normalizedScorerPlayerId = Number.isInteger(predicted_scorer_player_id)
    ? predicted_scorer_player_id
    : null;
  const normalizedScorerName = normalizedScorerPlayerId
    ? predicted_scorer_name?.trim() || null
    : null;

  const supabase = requireSupabase();
  const { data, error } = await supabase
    .from('cup_predictions')
    .upsert(
      {
        user_id,
        match_id,
        prediction_result,
        predicted_qualifier: predicted_qualifier ?? null,
        predicted_home,
        predicted_away,
        predicted_scorer_player_id: normalizedScorerPlayerId,
        predicted_scorer_name: normalizedScorerName,
      },
      { onConflict: 'user_id,match_id' },
    )
    .select('id,user_id,match_id,prediction_result,predicted_qualifier,predicted_home,predicted_away,predicted_scorer_player_id,predicted_scorer_name')
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
  players: CupTeamPlayer[],
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
  const playersByTeam = new Map<number, CupTeamPlayer[]>();

  for (const player of players) {
    const teamPlayers = playersByTeam.get(player.team_id) ?? [];
    teamPlayers.push(player);
    playersByTeam.set(player.team_id, teamPlayers);
  }

  return matches.map((match) => ({
    match,
    prediction: predictionsByMatch.get(match.id),
    points: pointsByMatch.get(match.id),
    players: [
      ...(match.home_team_id ? playersByTeam.get(match.home_team_id) ?? [] : []),
      ...(match.away_team_id ? playersByTeam.get(match.away_team_id) ?? [] : []),
    ],
  }));
}
