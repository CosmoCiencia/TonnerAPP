import { useEffect, useState } from 'react';
import type { MatchWithPrediction } from '../services/types';
import { formatRoundLabel } from '../services/stages';
import {
  getOutcomeLabel,
  getPredictionOutcome,
  type PredictionOutcome,
} from '../services/predictionOutcome';
import MatchStatusPill from './MatchStatusPill';
import TeamBadge from './TeamBadge';

type Props = {
  item: MatchWithPrediction;
  saving?: boolean;
  onSave: (id: string, result: PredictionOutcome) => void;
};

function formatEditDeadline(date: string) {
  return new Intl.DateTimeFormat('es-CO', {
    day: 'numeric',
    month: 'short',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(date));
}

function PredictionEditorCard({
  item,
  saving,
  onSave,
}: Props) {
  const { match, prediction } = item;
  const savedOutcome = getPredictionOutcome(prediction);

  const [selectedOutcome, setSelectedOutcome] = useState<PredictionOutcome | null>(
    savedOutcome,
  );
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const interval = window.setInterval(() => setNow(Date.now()), 30_000);
    return () => window.clearInterval(interval);
  }, []);

  const editDeadline = formatEditDeadline(match.date);
  const hasStarted = Date.parse(match.date) <= now;
  const isLocked = match.status === 'finished' || hasStarted;
  const selectedIsSaved = Boolean(savedOutcome && selectedOutcome === savedOutcome);
  const savePrediction = () => {
    if (!selectedOutcome) return;

    onSave(match.id, selectedOutcome);
  };
  const renderOutcomeButton = (outcome: PredictionOutcome, className = '') => {
    const selected = selectedOutcome === outcome;

    return (
      <button
        type="button"
        disabled={isLocked || saving}
        aria-pressed={selected}
        onClick={() => setSelectedOutcome(outcome)}
        className={`rounded-xl border px-2.5 py-2 text-[11px] font-black leading-none transition ${
          selected
            ? 'border-tonner-blue bg-tonner-blue text-white shadow-[0_10px_22px_rgba(45,89,199,0.22)]'
            : 'border-slate-200 bg-white text-tonner-blue'
        } ${className}`}
      >
        {getOutcomeLabel(match, outcome)}
      </button>
    );
  };

  return (
    <article className={`cup-card p-4 text-tonner-slate ${match.status === 'live' ? 'cup-card--live' : ''}`}>
      {match.status === 'live' ? <span className="cup-live-strip" aria-hidden="true" /> : null}
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">
            {formatRoundLabel(match.round)}
          </p>
          <p className="mt-2 truncate text-sm text-slate-500">{match.city}</p>
        </div>
        <MatchStatusPill status={match.status} />
      </div>

      <div>
        <div className="grid grid-cols-[minmax(0,1fr)_2.8rem_minmax(0,1fr)] items-start gap-2">
          <div className="min-w-0 text-center">
            <div className="flex justify-center">
              <TeamBadge name={match.team_home} logo={match.home_logo} size="lg" />
            </div>
            <p className="mx-auto mt-2 line-clamp-2 max-w-[6.3rem] text-sm font-black leading-tight text-tonner-slate">
              {match.team_home}
            </p>
            {renderOutcomeButton('home', 'mt-3 min-h-[2.45rem] w-full whitespace-nowrap')}
          </div>

          <div className="flex shrink-0 items-center justify-center pt-5">
            <span className="rounded-full bg-tonner-blue px-2.5 py-1 text-xs font-black text-white">
              VS
            </span>
          </div>

          <div className="min-w-0 text-center">
            <div className="flex justify-center">
              <TeamBadge name={match.team_away} logo={match.away_logo} size="lg" />
            </div>
            <p className="mx-auto mt-2 line-clamp-2 max-w-[6.3rem] text-sm font-black leading-tight text-tonner-slate">
              {match.team_away}
            </p>
            {renderOutcomeButton('away', 'mt-3 min-h-[2.45rem] w-full whitespace-nowrap')}
          </div>
        </div>
      </div>

      <div className="mt-3 flex justify-center">
        {renderOutcomeButton('draw', 'min-h-[2.45rem] min-w-[9rem] whitespace-nowrap px-5')}
      </div>

      <button
        type="button"
        disabled={isLocked || saving || !selectedOutcome}
        onClick={savePrediction}
        className={`mt-4 flex w-full items-center justify-center rounded-xl px-4 py-3 text-sm font-semibold text-white transition disabled:opacity-50 ${
          selectedIsSaved ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-tonner-blue hover:bg-[#0f5fd7]'
        }`}
      >
        {saving
          ? 'Guardando...'
          : isLocked
            ? 'Predicción cerrada'
            : selectedIsSaved
              ? 'Predicción guardada'
              : prediction
                ? 'Actualizar predicción'
                : 'Guardar predicción'}
      </button>

      <p className="mt-3 text-center text-xs text-slate-500">
        {isLocked
          ? 'Predicción cerrada. El partido ya inició.'
          : selectedIsSaved
            ? `Guardada. Puedes editarla hasta el ${editDeadline}.`
            : `Puedes editar tu predicción hasta el ${editDeadline}.`}
      </p>
    </article>
  );
}

export default PredictionEditorCard;
