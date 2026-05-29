import { Link } from 'react-router-dom';
import { formatRoundLabel } from '../services/stages';
import { getOutcomeLabel, getPredictionOutcome } from '../services/predictionOutcome';
import type { MatchWithPrediction } from '../services/types';
import TeamBadge from './TeamBadge';

type Props = {
  item: MatchWithPrediction;
  ctaTo?: string;
  ctaLabel?: string;
  showPredictionStatus?: boolean;
  showAction?: boolean;
};

function formatMatchMinute(elapsedMinutes: number | null, extraMinutes: number | null) {
  if (elapsedMinutes === null) return null;
  return extraMinutes ? `${elapsedMinutes}+${extraMinutes}'` : `${elapsedMinutes}'`;
}

function MatchCard({
  item,
  ctaTo = '/cup/predictions',
  ctaLabel,
  showPredictionStatus = false,
  showAction = true,
}: Props) {
  const { match, prediction } = item;
  const matchDate = new Intl.DateTimeFormat('es-CO', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(match.date));
  const actionLabel = ctaLabel ?? (prediction ? 'Editar predicción' : 'Predecir');
  const hasScore = match.score_home !== null && match.score_away !== null;
  const matchMinute = formatMatchMinute(match.elapsed_minutes, match.extra_minutes);
  const statusLabel = match.status === 'live'
    ? `EN VIVO${matchMinute ? ` · ${matchMinute}` : ''}`
    : match.status === 'finished'
      ? 'FINALIZADO'
      : 'NO INICIADO';

  return (
    <article className="cup-card p-3 text-tonner-slate">
      <div className="mb-3 text-center">
        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">
          {formatRoundLabel(match.round)}
        </p>
        <div className="mt-2 flex justify-center">
          <span
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-[0.14em] ${
              match.status === 'live'
                ? 'bg-red-50 text-red-700'
                : match.status === 'finished'
                  ? 'bg-emerald-50 text-emerald-700'
                  : 'bg-orange-50 text-tonner-orange'
            }`}
          >
            {match.status === 'live' ? (
              <span className="h-2 w-2 rounded-full bg-red-600" aria-hidden="true" />
            ) : null}
            {statusLabel}
          </span>
        </div>
        <p className="mt-2 text-xs font-black text-tonner-slate">{matchDate}</p>
        <p className="mx-auto mt-1 max-w-[16rem] truncate text-[11px] font-semibold text-slate-500">
          {match.city} · {match.stadium}
        </p>
      </div>

      <div className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-start gap-2">
        <div className="min-w-0 text-center">
          <div className="flex justify-center">
            <TeamBadge name={match.team_home} logo={match.home_logo} size="md" />
          </div>
          <p className="mx-auto mt-1.5 line-clamp-2 max-w-[6.3rem] text-sm font-black leading-tight text-tonner-slate">
            {match.team_home}
          </p>
        </div>

        <div className="flex min-w-[3.7rem] shrink-0 items-center justify-center pt-3">
          <span className="rounded-full bg-tonner-blue px-3 py-1 text-xs font-black text-white">
            {hasScore ? `${match.score_home} - ${match.score_away}` : 'VS'}
          </span>
        </div>

        <div className="min-w-0 text-center">
          <div className="flex justify-center">
            <TeamBadge name={match.team_away} logo={match.away_logo} size="md" />
          </div>
          <p className="mx-auto mt-1.5 line-clamp-2 max-w-[6.3rem] text-sm font-black leading-tight text-tonner-slate">
            {match.team_away}
          </p>
        </div>
      </div>

      <div className="mt-3 flex flex-col items-center gap-2 text-center">
        {showPredictionStatus ? (
          <div
            className={`rounded-full px-3 py-1 text-[11px] font-black uppercase tracking-[0.14em] ${
              prediction
                ? 'bg-emerald-50 text-emerald-700'
                : 'bg-orange-50 text-tonner-orange'
            }`}
          >
            {prediction ? `Tu pick: ${getOutcomeLabel(match, getPredictionOutcome(prediction))}` : 'Sin predicción'}
          </div>
        ) : null}

        {showAction ? (
          <Link
            to={ctaTo}
            className="shrink-0 rounded-xl bg-tonner-blue px-6 py-2 text-xs font-bold text-white"
          >
            {actionLabel}
          </Link>
        ) : null}
      </div>
    </article>
  );
}

export default MatchCard;
