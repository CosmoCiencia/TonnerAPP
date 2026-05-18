import { Link } from 'react-router-dom';
import type { MatchWithPrediction } from '../services/types';

type Props = {
  item: MatchWithPrediction;
  ctaTo?: string;
  ctaLabel?: string;
};

function MatchCard({ item, ctaTo = '/cup/predictions', ctaLabel = 'Predecir' }: Props) {
  const { match } = item;

  return (
    <article className="cup-card p-3">
      <div className="flex items-center justify-between gap-2">
        {/* LOCAL */}
        <div className="flex-1 min-w-0 text-xs truncate">{match.team_home}</div>

        {/* SCORE */}
        <div className="flex items-center gap-1">
          <span className="cup-score-box w-9 h-9 text-sm flex items-center justify-center">
            {match.score_home ?? '-'}
          </span>

          <span className="font-bold text-tonner-orange">-</span>

          <span className="cup-score-box w-9 h-9 text-sm flex items-center justify-center">
            {match.score_away ?? '-'}
          </span>
        </div>

        {/* VISITANTE */}
        <div className="flex-1 min-w-0 text-xs text-right truncate">{match.team_away}</div>

        {/* CTA */}
        <Link
          to={ctaTo}
          className="rounded bg-tonner-blue px-2 py-1 text-[10px] text-white"
        >
          {ctaLabel}
        </Link>
      </div>
    </article>
  );
}

export default MatchCard;
