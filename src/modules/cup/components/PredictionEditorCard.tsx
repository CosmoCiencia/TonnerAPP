import { useState } from 'react';
import type { MatchWithPrediction } from '../services/types';
import { formatRoundLabel } from '../services/stages';
import MatchStatusPill from './MatchStatusPill';
import TeamBadge from './TeamBadge';

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
    <article className="cup-card p-4 text-tonner-slate">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">
            {formatRoundLabel(match.round)}
          </p>
          <p className="mt-2 truncate text-sm text-slate-500">{match.city}</p>
        </div>
        <MatchStatusPill status={match.status} />
      </div>

      <div className="rounded-[1.35rem] border border-slate-200 bg-slate-50 p-3">
        <div className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-start gap-2">
          <div className="min-w-0 text-center">
            <div className="flex justify-center">
              <TeamBadge name={match.team_home} logo={match.home_logo} size="lg" />
            </div>
            <p className="mx-auto mt-2 line-clamp-2 max-w-[6.3rem] text-sm font-black leading-tight text-tonner-slate">
              {match.team_home}
            </p>
          </div>

          <div className="flex shrink-0 items-center justify-center gap-2 pt-1">
            <input
              type="number"
              min={0}
              value={homeValue}
              disabled={isLocked}
              onChange={(e) => setHomeValue(Number(e.target.value))}
              className="h-11 w-11 rounded-xl border border-slate-300 bg-white text-center text-lg font-bold text-tonner-slate outline-none transition focus:border-tonner-orange focus:ring-2 focus:ring-tonner-orange/20"
            />

            <span className="text-base font-black text-tonner-orange">-</span>

            <input
              type="number"
              min={0}
              value={awayValue}
              disabled={isLocked}
              onChange={(e) => setAwayValue(Number(e.target.value))}
              className="h-11 w-11 rounded-xl border border-slate-300 bg-white text-center text-lg font-bold text-tonner-slate outline-none transition focus:border-tonner-orange focus:ring-2 focus:ring-tonner-orange/20"
            />
          </div>

          <div className="min-w-0 text-center">
            <div className="flex justify-center">
              <TeamBadge name={match.team_away} logo={match.away_logo} size="lg" />
            </div>
            <p className="mx-auto mt-2 line-clamp-2 max-w-[6.3rem] text-sm font-black leading-tight text-tonner-slate">
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
