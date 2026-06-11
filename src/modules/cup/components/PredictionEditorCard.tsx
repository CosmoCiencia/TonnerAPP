import { ChevronDown } from 'lucide-react';
import { useEffect, useState } from 'react';
import type { CupTeamPlayer, MatchWithPrediction } from '../services/types';
import {
  getPredictionOutcome,
  getScoreOutcome,
  type PredictionOutcome,
} from '../services/predictionOutcome';
import TeamBadge from './TeamBadge';

type Props = {
  item: MatchWithPrediction;
  saving?: boolean;
  onSave: (
    id: string,
    predictionResult: PredictionOutcome,
    predictedHome: number,
    predictedAway: number,
    predictedScorerPlayerId?: number | null,
    predictedScorerName?: string | null
  ) => void;
};

const MAX_PREDICTED_SCORE = 20;

function formatEditDeadline(date: string) {
  return new Intl.DateTimeFormat('es-CO', {
    day: 'numeric',
    month: 'short',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(date));
}

function formatMatchTime(date: string) {
  return new Intl.DateTimeFormat('es-CO', {
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(date));
}

function formatMatchMinute(elapsedMinutes: number | null, extraMinutes: number | null) {
  if (elapsedMinutes === null) return 'EN VIVO';
  return extraMinutes ? `${elapsedMinutes}+${extraMinutes}'` : `${elapsedMinutes}'`;
}

function getPlayerLabel(player: CupTeamPlayer) {
  const numberLabel = player.number ? `#${player.number} ` : '';
  const positionLabel = player.position ? ` · ${player.position}` : '';
  return `${numberLabel}${player.player_name}${positionLabel}`;
}

function PredictionEditorCard({ item, saving, onSave }: Props) {
  const { match, prediction, players } = item;
  const savedOutcome = getPredictionOutcome(prediction);
  const [expanded, setExpanded] = useState(false);
  const [selectedOutcome, setSelectedOutcome] = useState<PredictionOutcome | null>(savedOutcome);
  const [selectedHome, setSelectedHome] = useState(
    prediction ? String(prediction.predicted_home) : ''
  );
  const [selectedAway, setSelectedAway] = useState(
    prediction ? String(prediction.predicted_away) : ''
  );
  const [selectedScorerId, setSelectedScorerId] = useState(
    prediction?.predicted_scorer_player_id ? String(prediction.predicted_scorer_player_id) : ''
  );
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const interval = window.setInterval(() => setNow(Date.now()), 30_000);
    return () => window.clearInterval(interval);
  }, []);

  const editDeadline = formatEditDeadline(match.date);
  const hasStarted = Date.parse(match.date) <= now;
  const isLocked = match.status === 'finished' || hasStarted;
  const predictedHome = Number(selectedHome);
  const predictedAway = Number(selectedAway);
  const hasValidScore =
    selectedHome !== '' &&
    selectedAway !== '' &&
    Number.isInteger(predictedHome) &&
    Number.isInteger(predictedAway) &&
    predictedHome >= 0 &&
    predictedAway >= 0 &&
    predictedHome <= MAX_PREDICTED_SCORE &&
    predictedAway <= MAX_PREDICTED_SCORE;
  const scoreOutcome = hasValidScore ? getScoreOutcome(predictedHome, predictedAway) : null;
  const scoreMatchesOutcome = Boolean(selectedOutcome && scoreOutcome === selectedOutcome);
  const selectedScorerPlayerId = selectedScorerId ? Number(selectedScorerId) : null;
  const selectedIsSaved = Boolean(
    prediction &&
    hasValidScore &&
    selectedOutcome === savedOutcome &&
    predictedHome === prediction.predicted_home &&
    predictedAway === prediction.predicted_away &&
    selectedScorerPlayerId === prediction.predicted_scorer_player_id
  );
  const selectedScorer =
    players.find((player) => String(player.player_id) === selectedScorerId) ?? null;
  const homePlayers = match.home_team_id
    ? players.filter((player) => player.team_id === match.home_team_id)
    : [];
  const awayPlayers = match.away_team_id
    ? players.filter((player) => player.team_id === match.away_team_id)
    : [];
  const statusLabel =
    match.status === 'live'
      ? formatMatchMinute(match.elapsed_minutes, match.extra_minutes)
      : match.status === 'finished'
        ? 'FT'
        : formatMatchTime(match.date);

  const savePrediction = () => {
    if (!selectedOutcome || !hasValidScore || !scoreMatchesOutcome) return;
    onSave(
      match.id,
      selectedOutcome,
      predictedHome,
      predictedAway,
      selectedScorer?.player_id ?? null,
      selectedScorer?.player_name ?? null
    );
  };

  const renderOutcomeButton = (outcome: PredictionOutcome, label: string) => {
    const selected = selectedOutcome === outcome;

    return (
      <button
        type="button"
        disabled={isLocked || saving}
        aria-pressed={selected}
        onClick={() => setSelectedOutcome(outcome)}
        className={`min-w-0 rounded-md border px-1.5 py-2 text-[10px] font-black leading-tight transition ${
          selected
            ? 'border-tonner-blue bg-tonner-blue text-white'
            : 'border-slate-200 bg-white text-tonner-blue'
        }`}
      >
        <span className="block truncate">{label}</span>
      </button>
    );
  };

  return (
    <article
      className={`relative border-b border-slate-100 bg-white last:border-b-0 ${match.status === 'live' ? 'bg-red-50/30' : ''}`}
    >
      {match.status === 'live' ? <span className="cup-live-strip" aria-hidden="true" /> : null}
      <button
        type="button"
        onClick={() => setExpanded((current) => !current)}
        className="grid w-full grid-cols-[3.5rem_minmax(0,1fr)_3rem_1.5rem] items-center gap-2 px-3 py-2.5 text-left"
        aria-expanded={expanded}
      >
        <span
          className={`text-center text-[11px] font-black ${
            match.status === 'live'
              ? 'text-red-600'
              : match.status === 'finished'
                ? 'text-emerald-700'
                : 'text-slate-500'
          }`}
        >
          {match.status === 'live' ? (
            <span className="cup-live-dot mx-auto mb-1 block" aria-hidden="true" />
          ) : null}
          {statusLabel}
        </span>

        <span className="min-w-0">
          <span className="flex min-w-0 items-center gap-2">
            <TeamBadge name={match.team_home} logo={match.home_logo} size="xs" />
            <span className="truncate text-xs font-black text-tonner-slate">{match.team_home}</span>
          </span>
          <span className="mt-1.5 flex min-w-0 items-center gap-2">
            <TeamBadge name={match.team_away} logo={match.away_logo} size="xs" />
            <span className="truncate text-xs font-black text-tonner-slate">{match.team_away}</span>
          </span>
        </span>

        <span
          className={`text-center text-xs font-black ${prediction ? 'text-emerald-700' : 'text-slate-400'}`}
        >
          {prediction ? (
            <>
              <span className="block">{prediction.predicted_home}</span>
              <span className="mt-1.5 block">{prediction.predicted_away}</span>
            </>
          ) : (
            <span className="block text-[10px] leading-tight">Sin predicción</span>
          )}
        </span>

        <ChevronDown
          size={17}
          strokeWidth={2.5}
          className={`text-tonner-blue transition-transform ${expanded ? 'rotate-180' : ''}`}
          aria-hidden="true"
        />
      </button>

      {expanded ? (
        <div className="border-t border-slate-100 bg-slate-50/70 px-3 pb-3 pt-3">
          <div className="grid grid-cols-3 gap-1.5">
            {renderOutcomeButton('home', `Gana ${match.team_home}`)}
            {renderOutcomeButton('draw', 'Empate')}
            {renderOutcomeButton('away', `Gana ${match.team_away}`)}
          </div>

          <div className="mt-3 flex items-center justify-center gap-3">
            <label className="text-center">
              <span className="sr-only">Goles de {match.team_home}</span>
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                disabled={isLocked || saving}
                value={selectedHome}
                onChange={(event) =>
                  setSelectedHome(event.target.value.replace(/\D/g, '').slice(0, 2))
                }
                className="h-9 w-12 rounded-md border border-slate-200 bg-white px-1 text-center text-base font-black text-tonner-blue outline-none transition focus:border-tonner-blue disabled:opacity-50"
                placeholder="0"
              />
            </label>
            <span className="text-sm font-black text-slate-400">-</span>
            <label className="text-center">
              <span className="sr-only">Goles de {match.team_away}</span>
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                disabled={isLocked || saving}
                value={selectedAway}
                onChange={(event) =>
                  setSelectedAway(event.target.value.replace(/\D/g, '').slice(0, 2))
                }
                className="h-9 w-12 rounded-md border border-slate-200 bg-white px-1 text-center text-base font-black text-tonner-blue outline-none transition focus:border-tonner-blue disabled:opacity-50"
                placeholder="0"
              />
            </label>
          </div>

          <p
            className={`mt-2 text-center text-[10px] font-semibold ${
              hasValidScore && selectedOutcome && !scoreMatchesOutcome
                ? 'text-red-600'
                : 'text-slate-500'
            }`}
          >
            {hasValidScore && selectedOutcome && !scoreMatchesOutcome
              ? 'El marcador debe coincidir con tu elección.'
              : ''}
          </p>

          <div className="mt-3">
            <label className="block text-[10px] font-black uppercase tracking-[0.12em] text-slate-500">
              Goleador opcional
            </label>
            <select
              disabled={isLocked || saving || players.length === 0}
              value={selectedScorerId}
              onChange={(event) => setSelectedScorerId(event.target.value)}
              className="mt-1 h-9 w-full rounded-md border border-slate-200 bg-white px-2 text-xs font-bold text-tonner-slate outline-none transition focus:border-tonner-blue disabled:opacity-50"
            >
              <option value="">Sin goleador</option>
              {homePlayers.length > 0 ? (
                <optgroup label={match.team_home}>
                  {homePlayers.map((player) => (
                    <option key={`${player.team_id}-${player.player_id}`} value={player.player_id}>
                      {getPlayerLabel(player)}
                    </option>
                  ))}
                </optgroup>
              ) : null}
              {awayPlayers.length > 0 ? (
                <optgroup label={match.team_away}>
                  {awayPlayers.map((player) => (
                    <option key={`${player.team_id}-${player.player_id}`} value={player.player_id}>
                      {getPlayerLabel(player)}
                    </option>
                  ))}
                </optgroup>
              ) : null}
              {selectedScorerId && !selectedScorer && prediction?.predicted_scorer_name ? (
                <option value={selectedScorerId}>{prediction.predicted_scorer_name}</option>
              ) : null}
            </select>
            <p className="mt-1 text-center text-[10px] text-slate-500">
              {players.length > 0
                ? ''
                : 'Goleadores no disponibles para este partido.'}
            </p>
          </div>

          <button
            type="button"
            disabled={
              isLocked || saving || !selectedOutcome || !hasValidScore || !scoreMatchesOutcome
            }
            onClick={savePrediction}
            className={`mt-3 flex h-9 w-full items-center justify-center rounded-md px-3 text-xs font-black text-white transition disabled:opacity-50 ${
              selectedIsSaved ? 'bg-emerald-600' : 'bg-tonner-blue'
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

          <p className="mt-2 text-center text-[10px] text-slate-500">
            {isLocked ? 'El partido ya inició.' : `Editable hasta el ${editDeadline}.`}
          </p>
        </div>
      ) : null}
    </article>
  );
}

export default PredictionEditorCard;
