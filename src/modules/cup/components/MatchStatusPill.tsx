import type { MatchStatus } from '../services/types';

type Props = {
  status: MatchStatus;
};

function MatchStatusPill({ status }: Props) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] ${
        status === 'finished'
          ? 'bg-emerald-400/15 text-emerald-300'
          : 'bg-orange-400/15 text-orange-200'
      }`}
    >
      {status === 'finished' ? 'Finalizado' : 'Próximo'}
    </span>
  );
}

export default MatchStatusPill;
