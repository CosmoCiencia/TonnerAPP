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
  const [rankingError, setRankingError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [savingMatchId, setSavingMatchId] = useState<string | null>(null);
  const [refreshingRanking, setRefreshingRanking] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    let loadingData = false;

    async function load(options: { silent?: boolean } = {}) {
      if (loadingData) return;

      loadingData = true;
      if (!options.silent) {
        setLoading(true);
      }
      const hasValidUserId = isValidUserId(userId);

      const [matchesResult, predictionsResult, pointsResult, rankingResult] = await Promise.allSettled([
        fetchMatches(),
        hasValidUserId ? fetchPredictions(userId) : Promise.resolve([]),
        hasValidUserId ? fetchPoints(userId) : Promise.resolve([]),
        hasValidUserId ? fetchRanking(userId) : Promise.reject(new Error('No hay usuario autenticado para cargar el ranking.')),
      ]);

      if (!mounted) {
        loadingData = false;
        return;
      }

      if (matchesResult.status === 'fulfilled') {
        setMatches(matchesResult.value);
      } else if (!options.silent) {
        const message = matchesResult.reason instanceof Error ? matchesResult.reason.message : 'No se pudo cargar TonnerCup.';
        setToast(message);
      }

      setPredictions(predictionsResult.status === 'fulfilled' ? predictionsResult.value : []);
      setPoints(pointsResult.status === 'fulfilled' ? pointsResult.value : []);
      if (rankingResult.status === 'fulfilled') {
        setRanking(rankingResult.value);
        setRankingError(null);
      } else {
        const message = rankingResult.reason instanceof Error
          ? rankingResult.reason.message
          : 'No se pudo cargar el ranking.';
        console.error('[TonnerCup] Ranking load failed:', rankingResult.reason);
        setRankingError(message);
        if (!options.silent) {
          setToast(message);
        }
      }

      if (mounted) {
        if (!options.silent) {
          setLoading(false);
        }
        loadingData = false;
      }
    }

    void load();
    const refreshInterval = window.setInterval(() => void load({ silent: true }), 30_000);

    return () => {
      mounted = false;
      window.clearInterval(refreshInterval);
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
      if (!isValidUserId(userId)) {
        throw new Error('No hay usuario autenticado para actualizar el ranking.');
      }

      const rankingResponse = await fetchRanking(userId);
      setRanking(rankingResponse);
      setRankingError(null);
      if (options.showToast) {
        setToast('Ranking actualizado');
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'No se pudo actualizar el ranking.';
      console.error('[TonnerCup] Ranking refresh failed:', error);
      setRankingError(message);
      setToast(message);
    } finally {
      setRefreshingRanking(false);
    }
  }

  async function savePrediction(
    matchId: string,
    predictionResult: PredictionOutcome,
    predictedHome: number,
    predictedAway: number,
  ) {
    if (!isValidUserId(userId)) {
      setToast('Inicia sesión para guardar tu pronóstico.');
      return;
    }

    setSavingMatchId(matchId);
    try {
      const nextPrediction = await upsertPrediction(
        userId,
        matchId,
        predictionResult,
        predictedHome,
        predictedAway,
      );
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
    rankingError,
    points,
    savingMatchId,
    refreshingRanking,
    refreshRanking,
    savePrediction,
    toast,
  };
}
