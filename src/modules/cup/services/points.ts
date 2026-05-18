import type { Match, PointEntry, Prediction, RankingRow } from './types';

export function calculatePoints(match: Match, prediction: Prediction): number {
  if (match.status !== 'finished' || match.score_home === null || match.score_away === null) {
    return 0;
  }

  if (
    match.score_home === prediction.predicted_home &&
    match.score_away === prediction.predicted_away
  ) {
    return 3;
  }

  const realResult = Math.sign(match.score_home - match.score_away);
  const predictedResult = Math.sign(prediction.predicted_home - prediction.predicted_away);

  if (realResult === predictedResult) {
    return 1;
  }

  return 0;
}

export function buildPointEntries(matches: Match[], predictions: Prediction[]): PointEntry[] {
  const matchesById = new Map(matches.map((match) => [match.id, match]));

  return predictions
    .map((prediction) => {
      const match = matchesById.get(prediction.match_id);
      if (!match) return null;

      return {
        id: `pts-${prediction.user_id}-${prediction.match_id}`,
        user_id: prediction.user_id,
        match_id: prediction.match_id,
        points_awarded: calculatePoints(match, prediction),
      };
    })
    .filter((entry): entry is PointEntry => entry !== null);
}

export function buildRanking(points: PointEntry[]): RankingRow[] {
  const totals = new Map<string, { total_points: number; exact_hits: number }>();

  for (const entry of points) {
    const current = totals.get(entry.user_id) ?? { total_points: 0, exact_hits: 0 };
    current.total_points += entry.points_awarded;
    if (entry.points_awarded === 3) current.exact_hits += 1;
    totals.set(entry.user_id, current);
  }

  return [...totals.entries()]
    .sort((a, b) => {
      if (b[1].total_points !== a[1].total_points) {
        return b[1].total_points - a[1].total_points;
      }

      return b[1].exact_hits - a[1].exact_hits;
    })
    .map(([user_id, totalsEntry], index) => ({
      position: index + 1,
      user_id,
      total_points: totalsEntry.total_points,
      exact_hits: totalsEntry.exact_hits,
    }));
}
