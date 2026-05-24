import { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import EmptyState from '../components/EmptyState';
import LoadingCard from '../components/LoadingCard';
import PredictionEditorCard from '../components/PredictionEditorCard';
import SectionIntro from '../components/SectionIntro';
import { formatRoundLabel } from '../services/stages';
import type { ReturnTypeCupData } from './types';

function getDateKey(date: string) {
  return new Date(date).toISOString().slice(0, 10);
}

function formatDateRange(dateKeys: string[]) {
  if (!dateKeys.length) return '';

  const formatDate = (dateKey: string) =>
    new Intl.DateTimeFormat('es-CO', {
      day: 'numeric',
      month: 'short',
    }).format(new Date(`${dateKey}T12:00:00`));

  const firstDate = dateKeys[0];
  const lastDate = dateKeys[dateKeys.length - 1];

  return firstDate === lastDate ? formatDate(firstDate) : `${formatDate(firstDate)} - ${formatDate(lastDate)}`;
}

function formatMatchDateRange(matches: ReturnTypeCupData['userMatches']) {
  return formatDateRange([...new Set(matches.map((item) => getDateKey(item.match.date)))]);
}

function PredictionsPage() {
  const cupData = useOutletContext<ReturnTypeCupData>();

  const upcomingMatches = cupData.userMatches.filter(
    (item) => item.match.status === 'upcoming'
  );

  const rounds = [...new Set(upcomingMatches.map((m) => m.match.round))];

  const [activeRound, setActiveRound] = useState(rounds[0] || '');
  const selectedRound = rounds.includes(activeRound) ? activeRound : rounds[0];

  const filteredMatches = upcomingMatches.filter(
    (item) => item.match.round === selectedRound
  );
  const nextDateRange = formatMatchDateRange(filteredMatches.slice(0, 5));

  return (
    <section>
      <SectionIntro
        eyebrow="Predicciones"
        title="Elige tus pronósticos"
        description="Selecciona quién gana o si el partido empata."
      />

      <div className="mb-4 flex justify-center gap-2 overflow-x-auto pb-1">
        {rounds.map((round) => (
          <button
            key={round}
            type="button"
            onClick={() => setActiveRound(round)}
            className={`whitespace-nowrap rounded-xl px-4 py-2 text-sm font-medium transition ${
              selectedRound === round
                ? 'bg-tonner-blue text-white'
                : 'bg-white text-slate-500 shadow-[0_10px_24px_rgba(15,23,42,0.08)]'
            }`}
          >
            {formatRoundLabel(round)}
          </button>
        ))}
      </div>

      <div className="grid gap-3">
        {cupData.loading ? (
          Array.from({ length: 3 }, (_, index) => <LoadingCard key={index} />)
        ) : filteredMatches.length === 0 ? (
          <EmptyState
            title="No hay partidos en esta ronda"
            description="Selecciona otra ronda para ver más encuentros."
          />
        ) : (
          <>
            <div className="rounded-xl border border-white/15 bg-tonner-blue px-4 py-3 text-center text-white shadow-[0_12px_24px_rgba(8,43,104,0.2)]">
              <p className="font-display text-lg font-black">Próximos partidos</p>
              {nextDateRange ? (
                <div className="mt-2 flex justify-center">
                  <span className="rounded-full bg-white px-4 py-1.5 text-sm font-black capitalize text-tonner-blue shadow-[0_8px_18px_rgba(2,8,23,0.14)]">
                    {nextDateRange}
                  </span>
                </div>
              ) : null}
            </div>

            {filteredMatches.map((item) => (
              <PredictionEditorCard
                key={`${item.match.id}-${item.prediction?.predicted_home ?? 0}-${item.prediction?.predicted_away ?? 0}`}
                item={item}
                saving={cupData.savingMatchId === item.match.id}
                onSave={cupData.savePrediction}
              />
            ))}
          </>
        )}
      </div>
    </section>
  );
}

export default PredictionsPage;
