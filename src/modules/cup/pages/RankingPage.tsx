import { RefreshCw } from 'lucide-react';
import { useOutletContext } from 'react-router-dom';
import EmptyState from '../components/EmptyState';
import LoadingCard from '../components/LoadingCard';
import RankingTable from '../components/RankingTable';
import SectionIntro from '../components/SectionIntro';
import type { ReturnTypeCupData } from './types';
import { useUserId } from '../hooks/useUserId';

function RankingPage() {
  const cupData = useOutletContext<ReturnTypeCupData>();
  const userId = useUserId();

  return (
    <section>
      <SectionIntro
        eyebrow="Ranking"
        title="Tabla general de la polla"
        description="La clasificación se ordena por puntos totales y desempata por aciertos de ganador o empate."
      />

      <div className="mb-4 flex justify-end">
        <button
          type="button"
          onClick={() => void cupData.refreshRanking({ showToast: true })}
          disabled={cupData.refreshingRanking}
          className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-sm font-black text-tonner-blue shadow-[0_10px_24px_rgba(45,89,199,0.12)] disabled:opacity-60"
        >
          <RefreshCw
            size={16}
            strokeWidth={3}
            className={cupData.refreshingRanking ? 'animate-spin' : ''}
          />
          Actualizar
        </button>
      </div>

      {cupData.loading ? (
        <div className="grid gap-5">
          <LoadingCard />
          <LoadingCard />
        </div>
      ) : cupData.ranking.length === 0 ? (
        <EmptyState
          title="Todavía no hay ranking"
          description="Cuando los participantes guarden predicciones, aparecerá la tabla general."
        />
      ) : (
        <RankingTable
          ranking={cupData.ranking}
          currentUserId={userId}
        />
      )}
    </section>
  );
}

export default RankingPage;
