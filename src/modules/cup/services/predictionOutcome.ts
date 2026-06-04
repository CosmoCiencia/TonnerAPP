import type { Match, Prediction } from './types';

export type PredictionOutcome = 'home' | 'draw' | 'away';

export function getScoreOutcome(home: number, away: number): PredictionOutcome {
  if (home > away) return 'home';
  if (home < away) return 'away';
  return 'draw';
}

export function getPredictionOutcome(prediction?: Prediction): PredictionOutcome | null {
  if (!prediction) return null;
  if (prediction.prediction_result) return prediction.prediction_result;

  return getScoreOutcome(prediction.predicted_home, prediction.predicted_away);
}

export function getOutcomeLabel(match: Match, outcome: PredictionOutcome | null) {
  if (outcome === 'home') return `Gana ${match.team_home}`;
  if (outcome === 'away') return `Gana ${match.team_away}`;
  if (outcome === 'draw') return 'Empate';
  return 'Sin predicción';
}
