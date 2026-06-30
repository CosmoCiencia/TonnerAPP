import { ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getPredictionLabel } from '../services/predictionOutcome';
import type { MatchWithPrediction } from '../services/types';
import GoalEventsList from './GoalEventsList';
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
  const matchTime = new Intl.DateTimeFormat('es-CO', {
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(match.date));
  const actionLabel = ctaLabel ?? (prediction ? 'Editar predicción' : 'Predecir');
  const hasScore = match.score_home !== null && match.score_away !== null;
  const matchMinute = formatMatchMinute(match.elapsed_minutes, match.extra_minutes);
  const homeGoals = match.goal_events.filter((event) => event.side === 'home');
  const awayGoals = match.goal_events.filter((event) => event.side === 'away');
  const statusLabel = match.status === 'live'
    ? matchMinute ?? 'EN VIVO'
    : match.status === 'finished'
      ? 'FT'
      : matchTime;

  return (
    <article className={`relative border-b border-slate-100 bg-white last:border-b-0 ${match.status === 'live' ? 'bg-red-50/30' : ''}`}>
      {match.status === 'live' ? <span className="cup-live-strip" aria-hidden="true" /> : null}
      <div className="grid grid-cols-[3.5rem_minmax(0,1fr)_2.4rem] items-center gap-2 px-3 py-2.5">
        <div className={`text-center text-[11px] font-black ${
          match.status === 'live'
            ? 'text-red-600'
            : match.status === 'finished'
              ? 'text-emerald-700'
              : 'text-slate-500'
        }`}>
          {match.status === 'live' ? <span className="cup-live-dot mx-auto mb-1 block" aria-hidden="true" /> : null}
          <span>{statusLabel}</span>
        </div>

        <div className="min-w-0">
          <div className="grid grid-cols-[minmax(0,1fr)_1.5rem] items-center gap-2">
            <div className="flex min-w-0 items-center gap-2">
              <TeamBadge name={match.team_home} logo={match.home_logo} size="xs" />
              <div className="min-w-0">
                <p className="truncate text-xs font-black text-tonner-slate">{match.team_home}</p>
                <GoalEventsList events={homeGoals} />
              </div>
            </div>
            <span className="text-right text-xs font-black text-tonner-slate">
              {hasScore ? match.score_home : '-'}
            </span>
          </div>

          <div className="mt-1.5 grid grid-cols-[minmax(0,1fr)_1.5rem] items-center gap-2">
            <div className="flex min-w-0 items-center gap-2">
              <TeamBadge name={match.team_away} logo={match.away_logo} size="xs" />
              <div className="min-w-0">
                <p className="truncate text-xs font-black text-tonner-slate">{match.team_away}</p>
                <GoalEventsList events={awayGoals} />
              </div>
            </div>
            <span className="text-right text-xs font-black text-tonner-slate">
              {hasScore ? match.score_away : '-'}
            </span>
          </div>
        </div>

        <div className="flex justify-end">
          {showAction && match.status !== 'live' ? (
            <Link
              to={ctaTo}
              aria-label={actionLabel}
              className="flex h-8 w-8 items-center justify-center rounded-full text-tonner-blue hover:bg-blue-50"
            >
              <ChevronRight size={18} strokeWidth={2.5} aria-hidden="true" />
            </Link>
          ) : null}
        </div>
      </div>

      <div className="px-3 pb-2.5 pl-[4.25rem]">
        {showPredictionStatus ? (
          <p
            className={`truncate text-[10px] font-bold ${
              prediction
                ? 'text-emerald-700'
                : 'text-slate-400'
            }`}
          >
            {prediction
              ? `Tu predicción: ${prediction.predicted_home} - ${prediction.predicted_away} · ${getPredictionLabel(match, prediction)}${prediction.predicted_scorer_name ? ` · Gol: ${prediction.predicted_scorer_name}` : ''}`
              : 'Sin predicción'}
          </p>
        ) : null}
      </div>
    </article>
  );
}

export default MatchCard;
