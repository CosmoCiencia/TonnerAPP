import type { MatchStatus } from '../services/types';

export type MatchStatusFilterValue = 'all' | MatchStatus;

type Props = {
  value: MatchStatusFilterValue;
  counts: Record<MatchStatusFilterValue, number>;
  onChange: (value: MatchStatusFilterValue) => void;
};

const options: Array<{ value: MatchStatusFilterValue; label: string }> = [
  { value: 'all', label: 'Todos' },
  { value: 'live', label: 'En vivo' },
  { value: 'upcoming', label: 'Próximos' },
  { value: 'finished', label: 'Finalizados' },
];

function MatchStatusFilter({ value, counts, onChange }: Props) {
  return (
    <div className="grid w-full min-w-0 grid-cols-4 gap-1 rounded-lg bg-white/10 p-1">
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => onChange(option.value)}
          className={`min-w-0 rounded-md px-1 py-2 text-[10px] font-black transition ${
            value === option.value
              ? 'bg-white text-tonner-blue shadow-[0_5px_14px_rgba(15,23,42,0.14)]'
              : 'text-white/75'
          }`}
        >
          <span className="block truncate">{option.label}</span>
          <span className="mt-0.5 block text-[9px] opacity-70">{counts[option.value]}</span>
        </button>
      ))}
    </div>
  );
}

export default MatchStatusFilter;
