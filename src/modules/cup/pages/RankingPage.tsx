import { useOutletContext } from 'react-router-dom';
import LoadingCard from '../components/LoadingCard';
import RankingTable from '../components/RankingTable';
import SectionIntro from '../components/SectionIntro';
import type { ReturnTypeCupData } from './types';
import { useUserId } from '../hooks/useUserId';
import type { RankingRow } from '../services/types';

function RankingPage() {
  const cupData = useOutletContext<ReturnTypeCupData>();
  const userId = useUserId();

  const fallbackRanking: RankingRow[] = [
    { position: 1, user_id: 'carlos', total_points: 18, exact_hits: 5 },
    { position: 2, user_id: 'ana', total_points: 16, exact_hits: 4 },
    { position: 3, user_id: 'Tú', total_points: 14, exact_hits: 4 },
    { position: 4, user_id: 'luisa', total_points: 13, exact_hits: 3 },
    { position: 5, user_id: 'mateo', total_points: 11, exact_hits: 3 },
    { position: 6, user_id: 'sofia', total_points: 10, exact_hits: 2 },
    { position: 7, user_id: 'camila', total_points: 9, exact_hits: 2 },
    { position: 8, user_id: 'diego', total_points: 8, exact_hits: 2 },
    { position: 9, user_id: 'valentina', total_points: 6, exact_hits: 1 },
    { position: 10, user_id: 'andres', total_points: 4, exact_hits: 1 },
  ];

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
      ) : (
        <RankingTable
          ranking={cupData.ranking.length >= 10 ? cupData.ranking : fallbackRanking}
          currentUserId={userId}
        />
      )}
    </section>
  );
}

export default RankingPage;
