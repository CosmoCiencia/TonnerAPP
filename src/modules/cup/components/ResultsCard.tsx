import type { MatchWithPrediction } from '../services/types';

type Props = {
  item: MatchWithPrediction;
};

function ResultsCard({ item }: Props) {
  const { match, prediction, points } = item;

  return (
    <article className="cup-card p-3">
      <div className="flex items-center justify-between gap-2">
        {/* EQUIPOS */}
        <div className="flex-1 min-w-0 text-xs truncate">{match.team_home}</div>

        {/* RESULTADO REAL */}
        <div className="flex items-center gap-1 font-bold">
          <span>{match.score_home}</span>
          <span className="text-tonner-orange">-</span>
          <span>{match.score_away}</span>
        </div>

        <div className="flex-1 min-w-0 text-xs text-right truncate">{match.team_away}</div>
      </div>

      {/* INFO EXTRA */}
      <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500">
        {/* PREDICCIÓN */}
        <span className="truncate">
          🎯 {prediction ? `${prediction.predicted_home}-${prediction.predicted_away}` : '--'}
        </span>

        {/* PUNTOS */}
        <span className="font-semibold text-tonner-blue">+{points?.points_awarded ?? 0} pts</span>
      </div>
    </article>
  );
}

export default ResultsCard;
