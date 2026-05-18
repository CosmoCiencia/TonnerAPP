import { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import EmptyState from '../components/EmptyState';
import LoadingCard from '../components/LoadingCard';
import ResultsCard from '../components/ResultsCard';
import SectionIntro from '../components/SectionIntro';
import type { ReturnTypeCupData } from './types';

function ResultsPage() {
  const cupData = useOutletContext<ReturnTypeCupData>();

  const finishedMatches = cupData.userMatches.filter((item) => item.match.status === 'finished');

  const groups = [...new Set(finishedMatches.map((m) => m.match.group))];
  const [activeGroup, setActiveGroup] = useState(groups[0] || 'A');

  const filteredMatches = finishedMatches.filter((item) => item.match.group === activeGroup);

  return (
    <section>
      <SectionIntro
        eyebrow="Resultados"
        title="Resultados del Mundial"
        description="Selecciona un grupo para ver los resultados sin scroll infinito."
      />

      {/* 🔥 TABS */}
      <div className="flex gap-2 overflow-x-auto mb-4 pb-1">
        {groups.map((group) => (
          <button
            key={group}
            onClick={() => setActiveGroup(group)}
            className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition
              ${activeGroup === group ? 'bg-blue-600 text-white' : 'bg-zinc-800 text-gray-400'}`}
          >
            Grupo {group}
          </button>
        ))}
      </div>

      {/* 🔥 LISTA */}
      <div className="flex flex-col gap-4">
        {cupData.loading ? (
          Array.from({ length: 3 }, (_, index) => <LoadingCard key={index} />)
        ) : filteredMatches.length === 0 ? (
          <EmptyState
            title="No hay resultados en este grupo"
            description="Selecciona otro grupo para ver más partidos."
          />
        ) : (
          filteredMatches.map((item) => <ResultsCard key={item.match.id} item={item} />)
        )}
      </div>
    </section>
  );
}

export default ResultsPage;
