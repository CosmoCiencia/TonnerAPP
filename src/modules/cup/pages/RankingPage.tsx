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
        description="La clasificación se ordena por puntos totales y desempata por aciertos exactos."
      />

      {cupData.loading ? (
        <div className="grid gap-5">
          <LoadingCard />
          <LoadingCard />
        </div>
      ) : cupData.ranking.length === 0 ? (
        <EmptyState
          title="Todavía no hay ranking"
          description="Cuando el backend calcule puntos de partidos finalizados, aparecerá la tabla general."
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
