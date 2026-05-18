import { useEffect, useMemo, useState } from 'react';
import { fetchMatches } from '../services/matchesApi';
import {
  buildDerivedTables,
  fetchPredictions,
  getUserMatches,
  upsertPrediction,
} from '../services/predictionsStore';
import type { Match, MatchWithPrediction, Prediction, RankingRow } from '../services/types';

export function useCupData(userId: string) {
  const [matches, setMatches] = useState<Match[]>([]);
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingMatchId, setSavingMatchId] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function load() {
      setLoading(true);
      const [matchesResponse, predictionsResponse] = await Promise.all([
        fetchMatches(),
        fetchPredictions(),
      ]);

      if (!mounted) return;
      setMatches(matchesResponse);
      setPredictions(predictionsResponse);
      setLoading(false);
    }

    void load();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!toast) return;
    const timeout = window.setTimeout(() => setToast(null), 2200);
    return () => window.clearTimeout(timeout);
  }, [toast]);

  const derived = useMemo(() => buildDerivedTables(matches, predictions), [matches, predictions]);

  const userMatches: MatchWithPrediction[] = useMemo(
    () => getUserMatches(matches, predictions, derived.points, userId),
    [derived.points, matches, predictions, userId],
  );

  async function savePrediction(matchId: string, predictedHome: number, predictedAway: number) {
    setSavingMatchId(matchId);
    const nextPrediction = await upsertPrediction(userId, matchId, predictedHome, predictedAway);
    setPredictions((current) => {
      const exists = current.find((prediction) => prediction.id === nextPrediction.id);
      return exists
        ? current.map((prediction) =>
            prediction.id === nextPrediction.id ? nextPrediction : prediction,
          )
        : [...current, nextPrediction];
    });
    setSavingMatchId(null);
    setToast('Pronóstico guardado');
  }

  return {
    loading,
    matches,
    userMatches,
    ranking: derived.ranking as RankingRow[],
    points: derived.points,
    savingMatchId,
    savePrediction,
    toast,
  };
}
