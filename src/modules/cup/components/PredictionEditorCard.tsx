import { useState } from 'react';
import type { MatchWithPrediction } from '../services/types';
import { getTeamFlag } from '../services/teamMeta';
import MatchStatusPill from './MatchStatusPill';

type Props = {
  item: MatchWithPrediction;
  saving?: boolean;
  onSave: (id: string, home: number, away: number) => void;
};

function PredictionEditorCard({ item, saving, onSave }: Props) {
  const { match, prediction } = item;

  const [homeValue, setHomeValue] = useState(prediction?.predicted_home ?? 0);
  const [awayValue, setAwayValue] = useState(prediction?.predicted_away ?? 0);

  const isLocked = match.status === 'finished';

  return (
    <article className="cup-card p-4">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[10px] uppercase tracking-[0.22em] text-slate-400">
            {match.stage} · Grupo {match.group}
          </p>
          <p className="mt-2 text-sm text-slate-500">{match.city}</p>
        </div>
        <MatchStatusPill status={match.status} />
      </div>

      <div className="rounded-[1.7rem] border border-slate-200 bg-slate-50 p-4">
        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
          <div className="min-w-0 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center text-2xl">
              {getTeamFlag(match.team_home)}
            </div>
            <p className="mt-2 text-sm font-medium leading-tight text-tonner-slate">
              {match.team_home}
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <input
              type="number"
              min={0}
              value={homeValue}
              disabled={isLocked}
              onChange={(e) => setHomeValue(Number(e.target.value))}
              className="h-12 w-12 rounded-xl border border-slate-300 bg-white text-center text-lg font-bold text-tonner-slate outline-none transition focus:border-tonner-orange focus:ring-2 focus:ring-tonner-orange/20"
            />

            <span className="text-lg font-black text-tonner-orange">-</span>

            <input
              type="number"
              min={0}
              value={awayValue}
              disabled={isLocked}
              onChange={(e) => setAwayValue(Number(e.target.value))}
              className="h-12 w-12 rounded-xl border border-slate-300 bg-white text-center text-lg font-bold text-tonner-slate outline-none transition focus:border-tonner-orange focus:ring-2 focus:ring-tonner-orange/20"
            />
          </div>

          <div className="min-w-0 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center text-2xl">
              {getTeamFlag(match.team_away)}
            </div>
            <p className="mt-2 text-sm font-medium leading-tight text-tonner-slate">
              {match.team_away}
            </p>
          </div>
        </div>
      </div>

      <button
        type="button"
        disabled={isLocked || saving}
        onClick={() => onSave(match.id, homeValue, awayValue)}
        className="mt-4 flex w-full items-center justify-center rounded-xl bg-tonner-blue px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#0f5fd7] disabled:opacity-50"
      >
        {saving ? 'Aplicando...' : 'Aplicar resultado'}
      </button>

      <p className="mt-3 text-center text-xs text-slate-500">
        {isLocked
          ? 'Este partido ya no admite cambios.'
          : 'Puedes editar tu marcador antes del inicio del partido.'}
      </p>
    </article>
  );
}

export default PredictionEditorCard;
