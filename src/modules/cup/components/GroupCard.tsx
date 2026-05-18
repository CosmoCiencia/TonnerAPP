import type { GroupOverview } from '../services/types';

type Props = {
  group: GroupOverview;
};

function GroupCard({ group }: Props) {
  return (
    <article className="cup-card p-3">
      {/* HEADER */}
      <div className="mb-2 flex items-center justify-between">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-tonner-blue">
          Grupo {group.group}
        </p>
        <span className="text-[10px] text-slate-400">Top 2 clasifican</span>
      </div>

      {/* TABLA SIMPLE */}
      <div className="space-y-1">
        {group.standings.map((row, index) => (
          <div key={row.team} className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 min-w-0">
              <span
                className={`text-[10px] w-4 ${
                  index < 2 ? 'text-tonner-blue font-bold' : 'text-slate-400'
                }`}
              >
                {index + 1}
              </span>

              <span className="truncate">{row.team}</span>
            </div>

            <span className={`font-bold ${index < 2 ? 'text-tonner-blue' : 'text-slate-400'}`}>
              {row.points} pts
            </span>
          </div>
        ))}
      </div>
    </article>
  );
}

export default GroupCard;
