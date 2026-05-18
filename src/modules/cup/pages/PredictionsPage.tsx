import { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import EmptyState from '../components/EmptyState';
import LoadingCard from '../components/LoadingCard';
import PredictionEditorCard from '../components/PredictionEditorCard';
import SectionIntro from '../components/SectionIntro';
import type { ReturnTypeCupData } from './types';

function PredictionsPage() {
  const cupData = useOutletContext<ReturnTypeCupData>();

  const upcomingMatches = cupData.userMatches.filter(
    (item) => item.match.status === 'upcoming'
  );

  const groups = [...new Set(upcomingMatches.map((m) => m.match.group))];

  const [activeGroup, setActiveGroup] = useState(groups[0] || 'A');

  const filteredMatches = upcomingMatches.filter(
    (item) => item.match.group === activeGroup
  );

  return (
    <section>
      <SectionIntro
        eyebrow="Predicciones"
        title="Marca tus resultados"
        description="Selecciona un grupo y haz tus picks sin scroll infinito."
      />

      <div className="mb-4 flex gap-2 overflow-x-auto pb-1">
        {groups.map((group) => (
          <button
            key={group}
            type="button"
            onClick={() => setActiveGroup(group)}
            className={`whitespace-nowrap rounded-xl px-4 py-2 text-sm font-medium transition ${
              activeGroup === group
                ? 'bg-tonner-blue text-white'
                : 'bg-white text-slate-500 shadow-[0_10px_24px_rgba(15,23,42,0.08)]'
            }`}
          >
            Grupo {group}
          </button>
        ))}
      </div>

      <div className="grid gap-3 lg:grid-cols-2">
        {cupData.loading ? (
          Array.from({ length: 3 }, (_, index) => <LoadingCard key={index} />)
        ) : filteredMatches.length === 0 ? (
          <EmptyState
            title="No hay partidos en este grupo"
            description="Selecciona otro grupo para ver más encuentros."
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
