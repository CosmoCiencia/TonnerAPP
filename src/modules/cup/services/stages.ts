import type { MatchWithPrediction } from './types';

export const cupStages = [
  {
    slug: 'todos',
    title: 'Partidos',
    description: 'Calendario de partidos disponibles.',
  },
  {
    slug: 'fase-de-grupos',
    title: 'Fase de grupos',
    description: 'Calendario de la Polla Tonner.',
  },
  {
    slug: 'dieciseisavos',
    title: 'Dieciseisavos',
    description: 'Esta fase aparecerá cuando API-Football publique esos fixtures.',
  },
  {
    slug: 'octavos',
    title: 'Octavos',
    description: 'Esta fase aparecerá cuando API-Football publique esos fixtures.',
  },
  {
    slug: 'cuartos',
    title: 'Cuartos',
    description: 'Esta fase aparecerá cuando API-Football publique esos fixtures.',
  },
  {
    slug: 'semifinal',
    title: 'Semifinal',
    description: 'Esta fase aparecerá cuando API-Football publique esos fixtures.',
  },
  {
    slug: 'final',
    title: 'Final',
    description: 'Esta fase aparecerá cuando API-Football publique esos fixtures.',
  },
] as const;

export type CupStageSlug = (typeof cupStages)[number]['slug'];

export function getCupStage(slug: string | undefined) {
  return cupStages.find((stage) => stage.slug === slug) ?? cupStages[0];
}

export function stageMatches(matches: MatchWithPrediction[], slug: string) {
  const stage = getCupStage(slug);

  if (stage.slug === 'todos') {
    return matches;
  }

  return matches.filter((item) => item.match.stage === stage.title);
}

export function formatRoundLabel(round: string) {
  const groupStageMatch = round.match(/^Group Stage - (\d+)$/i);

  if (groupStageMatch) {
    return `Jornada ${groupStageMatch[1]}`;
  }

  return round;
}
