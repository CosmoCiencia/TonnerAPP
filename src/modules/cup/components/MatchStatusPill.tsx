import type { MatchStatus } from '../services/types';

type Props = {
  status: MatchStatus;
};

const statusStyles: Record<MatchStatus, string> = {
  finished: 'bg-emerald-400/15 text-emerald-300',
  live: 'bg-red-400/15 text-red-200',
  upcoming: 'bg-orange-400/15 text-orange-200',
};

const statusLabels: Record<MatchStatus, string> = {
  finished: 'Finalizado',
  live: 'En vivo',
  upcoming: 'No iniciado',
};

function MatchStatusPill({ status }: Props) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] ${statusStyles[status]}`}
    >
      {status === 'live' ? <span className="cup-live-dot" aria-hidden="true" /> : null}
      {statusLabels[status]}
    </span>
  );
}

export default MatchStatusPill;
