import type { RankingRow } from '../services/types';

type Props = {
  ranking: RankingRow[];
  currentUserId: string;
};

function RankingTable({ ranking, currentUserId }: Props) {
  return (
    <div className="cup-card overflow-hidden">
      <div className="grid gap-3">
        {ranking.map((row) => (
          <div
            key={row.user_id}
            className={`rounded-[1.4rem] border px-4 py-4 ${
              row.position === 1
                ? 'border-yellow-300/40 bg-[linear-gradient(90deg,rgba(255,190,11,0.22),rgba(255,255,255,1))] shadow-[0_0_30px_rgba(255,190,11,0.2)]'
                : row.position === 2
                  ? 'border-slate-200 bg-white'
                  : row.position === 3
                    ? 'border-orange-300/30 bg-[linear-gradient(90deg,rgba(255,125,0,0.12),rgba(255,255,255,1))]'
                    : 'border-slate-200 bg-white'
            } ${row.user_id === currentUserId ? 'ring-1 ring-tonner-blue/40' : ''}`}
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-tonner-blue text-base font-black text-white sm:h-12 sm:w-12 sm:text-lg">
                  #{row.position}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-base font-bold text-tonner-slate sm:text-lg">{row.user_id}</p>
                  <p className="text-xs uppercase tracking-[0.22em] text-slate-500">
                    {row.position === 1 ? 'Lider con glow' : 'Competidor mundialista'}
                  </p>
                </div>
              </div>
              <div className="grid w-full grid-cols-2 gap-3 sm:w-auto">
                <div className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3 text-center sm:px-4">
                  <p className="text-[11px] uppercase tracking-[0.24em] text-slate-500">Puntos</p>
                  <p className="mt-1 text-2xl font-black text-tonner-slate">{row.total_points}</p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3 text-center sm:px-4">
                  <p className="text-[11px] uppercase tracking-[0.24em] text-slate-500">Exactos</p>
                  <p className="mt-1 text-2xl font-black text-tonner-slate">{row.exact_hits}</p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default RankingTable;
