import { useEffect, useMemo, useState } from 'react';
import { fetchMatches } from '../services/matchesApi';
import {
  fetchPoints,
  fetchPredictions,
  fetchRanking,
  getUserMatches,
  upsertPrediction,
} from '../services/predictionsStore';
import type { PredictionOutcome } from '../services/predictionOutcome';
import type { Match, MatchWithPrediction, PointEntry, Prediction, RankingRow } from '../services/types';

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function isValidUserId(userId: string | null): userId is string {
  return Boolean(userId && UUID_PATTERN.test(userId));
}

export function useCupData(userId: string | null) {
  const [matches, setMatches] = useState<Match[]>([]);
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [points, setPoints] = useState<PointEntry[]>([]);
  const [ranking, setRanking] = useState<RankingRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingMatchId, setSavingMatchId] = useState<string | null>(null);
  const [refreshingRanking, setRefreshingRanking] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function load() {
      setLoading(true);
      const hasValidUserId = isValidUserId(userId);

      try {
        const matchesResponse = await fetchMatches();
        if (!mounted) return;

        setMatches(matchesResponse);
      } catch (error) {
        if (!mounted) return;
        const message = error instanceof Error ? error.message : 'No se pudo cargar TonnerCup.';
        setToast(message);
      }

      if (!mounted) return;

      if (hasValidUserId) {
        const [predictionsResult, pointsResult] = await Promise.allSettled([
          fetchPredictions(userId),
          fetchPoints(userId),
        ]);

        if (!mounted) return;

        if (predictionsResult.status === 'fulfilled') {
          setPredictions(predictionsResult.value);
        } else {
          setPredictions([]);
        }

        if (pointsResult.status === 'fulfilled') {
          setPoints(pointsResult.value);
        } else {
          setPoints([]);
        }
      } else {
        setPredictions([]);
        setPoints([]);
      }

      try {
        const rankingResponse = await fetchRanking();
        if (!mounted) return;
        setRanking(rankingResponse);
      } catch {
        if (!mounted) return;
        setRanking([]);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    void load();

    return () => {
      mounted = false;
    };
  }, [userId]);

  useEffect(() => {
    if (!toast) return;
    const timeout = window.setTimeout(() => setToast(null), 2200);
    return () => window.clearTimeout(timeout);
  }, [toast]);

  const userMatches: MatchWithPrediction[] = useMemo(
    () => getUserMatches(matches, predictions, points, userId ?? ''),
    [matches, points, predictions, userId],
  );

  async function refreshRanking(options: { showToast?: boolean } = {}) {
    setRefreshingRanking(true);
    try {
      const rankingResponse = await fetchRanking();
      setRanking(rankingResponse);
      if (options.showToast) {
        setToast('Ranking actualizado');
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'No se pudo actualizar el ranking.';
      setToast(message);
    } finally {
      setRefreshingRanking(false);
    }
  }

  async function savePrediction(matchId: string, predictionResult: PredictionOutcome) {
    if (!isValidUserId(userId)) {
      setToast('Inicia sesión para guardar tu pronóstico.');
      return;
    }

    setSavingMatchId(matchId);
    try {
      const nextPrediction = await upsertPrediction(userId, matchId, predictionResult);
      setPredictions((current) => {
        const exists = current.find((prediction) => prediction.id === nextPrediction.id);
        return exists
          ? current.map((prediction) =>
              prediction.id === nextPrediction.id ? nextPrediction : prediction,
            )
          : [...current, nextPrediction];
      });
      void refreshRanking();
      setToast('Pronóstico guardado');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'No se pudo guardar el pronóstico.';
      setToast(message);
    } finally {
      setSavingMatchId(null);
    }
  }

  return {
    loading,
    matches,
    userMatches,
    ranking,
    points,
    savingMatchId,
    refreshingRanking,
    refreshRanking,
    savePrediction,
    toast,
  };
}
