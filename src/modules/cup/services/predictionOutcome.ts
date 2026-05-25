import type { Match, Prediction } from './types';

export type PredictionOutcome = 'home' | 'draw' | 'away';

export function getPredictionOutcome(prediction?: Prediction): PredictionOutcome | null {
  if (!prediction) return null;
  if (prediction.prediction_result) return prediction.prediction_result;

  if (prediction.predicted_home > prediction.predicted_away) return 'home';
  if (prediction.predicted_home < prediction.predicted_away) return 'away';
  return 'draw';
}

export function getOutcomeScore(outcome: PredictionOutcome) {
  if (outcome === 'home') return { home: 1, away: 0 };
  if (outcome === 'away') return { home: 0, away: 1 };
  return { home: 0, away: 0 };
}

export function getOutcomeLabel(match: Match, outcome: PredictionOutcome | null) {
  if (outcome === 'home') return `Gana ${match.team_home}`;
  if (outcome === 'away') return `Gana ${match.team_away}`;
  if (outcome === 'draw') return 'Empate';
  return 'Sin predicción';
}
