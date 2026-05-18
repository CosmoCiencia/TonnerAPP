import { seededPredictions } from './mockData';
import { buildPointEntries, buildRanking } from './points';
import type { Match, MatchWithPrediction, PointEntry, Prediction, RankingRow } from './types';

const STORAGE_KEY = 'tonner-cup-predictions';

function readStoredPredictions(): Prediction[] {
  if (typeof window === 'undefined') return seededPredictions;
  const saved = window.localStorage.getItem(STORAGE_KEY);
  if (!saved) return seededPredictions;

  try {
    return JSON.parse(saved) as Prediction[];
  } catch {
    return seededPredictions;
  }
}

function persistPredictions(predictions: Prediction[]) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(predictions));
}

export async function fetchPredictions(): Promise<Prediction[]> {
  await new Promise((resolve) => setTimeout(resolve, 250));
  return readStoredPredictions();
}

export async function upsertPrediction(
  user_id: string,
  match_id: string,
  predicted_home: number,
  predicted_away: number,
): Promise<Prediction> {
  const predictions = readStoredPredictions();
  const existing = predictions.find(
    (prediction) => prediction.user_id === user_id && prediction.match_id === match_id,
  );

  const nextPrediction: Prediction = existing
    ? {
        ...existing,
        predicted_home,
        predicted_away,
      }
    : {
        id: `prediction-${user_id}-${match_id}`,
        user_id,
        match_id,
        predicted_home,
        predicted_away,
      };

  const nextPredictions = existing
    ? predictions.map((prediction) => (prediction.id === existing.id ? nextPrediction : prediction))
    : [...predictions, nextPrediction];

  persistPredictions(nextPredictions);
  await new Promise((resolve) => setTimeout(resolve, 180));
  return nextPrediction;
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

export function buildDerivedTables(matches: Match[], predictions: Prediction[]): {
  points: PointEntry[];
  ranking: RankingRow[];
} {
  const points = buildPointEntries(matches, predictions);
  return {
    points,
    ranking: buildRanking(points),
  };
}
