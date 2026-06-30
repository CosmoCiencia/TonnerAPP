import type { Match, Prediction } from './types';

export type PredictionOutcome = 'home' | 'draw' | 'away';
export type PredictedQualifier = Exclude<PredictionOutcome, 'draw'>;

export function isKnockoutMatch(match: Match) {
  const phase = `${match.stage} ${match.round}`.toLowerCase();
  if (phase.includes('group') || phase.includes('fase de grupos')) return false;

  return [
    'round of',
    'knockout',
    'dieciseisavos',
    'octavos',
    'quarter',
    'cuartos',
    'semi',
    'final',
  ].some((stageName) => phase.includes(stageName));
}

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

export function getPredictionLabel(match: Match, prediction: Prediction) {
  const outcome = getPredictionOutcome(prediction);
  if (!isKnockoutMatch(match)) return getOutcomeLabel(match, outcome);

  const qualifier = prediction.predicted_qualifier ?? (outcome === 'draw' ? null : outcome);
  if (qualifier === 'home') return `Clasifica ${match.team_home}`;
  if (qualifier === 'away') return `Clasifica ${match.team_away}`;
  return 'Falta elegir quién clasifica';
}
