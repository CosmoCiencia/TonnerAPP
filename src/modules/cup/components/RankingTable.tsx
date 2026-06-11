import { useEffect, useRef } from 'react';
import type { RankingRow } from '../services/types';

type Props = {
  ranking: RankingRow[];
  currentUserId: string | null;
};

const cupUserTypeLabels = {
  public: 'Público',
  internal: 'Interno',
  distributor: 'Distribuidor',
} as const;

function RankingTable({ ranking, currentUserId }: Props) {
  const currentUserRowRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!currentUserId || !currentUserRowRef.current) return;

    const frameId = window.requestAnimationFrame(() => {
      currentUserRowRef.current?.scrollIntoView({
        block: 'center',
        inline: 'nearest',
        behavior: 'auto',
      });
    });

    return () => window.cancelAnimationFrame(frameId);
  }, [currentUserId, ranking]);

  return (
    <div className="cup-card overflow-hidden">
      <div className="grid gap-3">
        {ranking.map((row) => {
          const isCurrentUser = row.user_id === currentUserId;

          return (
            <div
              ref={isCurrentUser ? currentUserRowRef : undefined}
              key={row.user_id}
              className={`rounded-[1.4rem] border px-4 py-4 ${
                isCurrentUser
                  ? 'border-tonner-blue bg-blue-50 shadow-[0_0_0_2px_rgba(45,89,199,0.18),0_18px_32px_rgba(45,89,199,0.14)]'
                  : row.position === 1
                    ? 'border-yellow-300/40 bg-[linear-gradient(90deg,rgba(255,190,11,0.22),rgba(255,255,255,1))] shadow-[0_0_30px_rgba(255,190,11,0.2)]'
                    : row.position === 2
                      ? 'border-slate-200 bg-white'
                      : row.position === 3
                        ? 'border-orange-300/30 bg-[linear-gradient(90deg,rgba(255,125,0,0.12),rgba(255,255,255,1))]'
                        : 'border-slate-200 bg-white'
              }`}
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-tonner-blue text-base font-black text-white sm:h-12 sm:w-12 sm:text-lg">
                    #{row.position}
                  </div>
                  <div className="min-w-0">
                    <div className="flex min-w-0 flex-wrap items-center gap-2">
                      <p className="truncate text-base font-bold text-tonner-slate sm:text-lg">
                        {row.display_name ?? 'Participante'}
                      </p>
                      {isCurrentUser ? (
                        <span className="shrink-0 rounded-full bg-tonner-blue px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.14em] text-white">
                          Tú
                        </span>
                      ) : null}
                    </div>
                    <p className="text-xs uppercase tracking-[0.22em] text-slate-500">
                      {row.cup_user_type ? cupUserTypeLabels[row.cup_user_type] : 'Competidor mundialista'}
                    </p>
                  </div>
                </div>
                <div className="grid w-full min-w-0 grid-cols-3 gap-1.5 sm:w-auto sm:min-w-[21rem] sm:gap-3">
                  <div className="min-w-0 rounded-xl border border-slate-200 bg-slate-50 px-1.5 py-2 text-center sm:rounded-2xl sm:px-4 sm:py-3">
                    <p className="whitespace-nowrap text-[9px] font-bold uppercase tracking-[0.08em] text-slate-500 sm:text-[11px] sm:tracking-[0.18em]">Puntos</p>
                    <p className="mt-1 text-xl font-black leading-none text-tonner-slate sm:text-2xl">{row.total_points}</p>
                  </div>
                  <div className="min-w-0 rounded-xl border border-slate-200 bg-slate-50 px-1.5 py-2 text-center sm:rounded-2xl sm:px-4 sm:py-3">
                    <p className="whitespace-nowrap text-[9px] font-bold uppercase tracking-[0.08em] text-slate-500 sm:text-[11px] sm:tracking-[0.18em]">Aciertos</p>
                    <p className="mt-1 text-xl font-black leading-none text-tonner-slate sm:text-2xl">{row.exact_hits}</p>
                  </div>
                  <div className="min-w-0 rounded-xl border border-slate-200 bg-slate-50 px-1.5 py-2 text-center sm:rounded-2xl sm:px-4 sm:py-3">
                    <p className="whitespace-nowrap text-[9px] font-bold uppercase tracking-[0.08em] text-slate-500 sm:text-[11px] sm:tracking-[0.18em]">Predicciones</p>
                    <p className="mt-1 text-xl font-black leading-none text-tonner-slate sm:text-2xl">{row.prediction_count}</p>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default RankingTable;
