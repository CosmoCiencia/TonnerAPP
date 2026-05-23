import { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import EmptyState from '../components/EmptyState';
import LoadingCard from '../components/LoadingCard';
import PredictionEditorCard from '../components/PredictionEditorCard';
import SectionIntro from '../components/SectionIntro';
import { formatRoundLabel } from '../services/stages';
import type { ReturnTypeCupData } from './types';

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

  return (
    <section>
      <SectionIntro
        eyebrow="Predicciones"
        title="Marca tus resultados"
        description="Selecciona una ronda real y haz tus picks sin scroll infinito."
      />

      <div className="mb-4 flex gap-2 overflow-x-auto pb-1">
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
          filteredMatches.map((item) => (
            <PredictionEditorCard
              key={`${item.match.id}-${item.prediction?.predicted_home ?? 0}-${item.prediction?.predicted_away ?? 0}`}
              item={item}
              saving={cupData.savingMatchId === item.match.id}
              onSave={cupData.savePrediction}
            />
          ))
        )}
      </div>
    </section>
  );
}

export default PredictionsPage;
