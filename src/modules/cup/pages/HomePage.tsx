import { useOutletContext, Link } from 'react-router-dom';
import GroupCard from '../components/GroupCard';
import MatchCard from '../components/MatchCard';
import EmptyState from '../components/EmptyState';
import LoadingCard from '../components/LoadingCard';
import SectionIntro from '../components/SectionIntro';
import { mockGroups } from '../services/mockData';
import type { ReturnTypeCupData } from './types';

function HomePage() {
  const cupData = useOutletContext<ReturnTypeCupData>();

  const upcomingMatches = cupData.userMatches.filter((item) => item.match.status === 'upcoming');

  const nextMatch = upcomingMatches[0];
  const nextMatches = upcomingMatches.slice(1, 4);

  return (
    <section className="space-y-5">
      <SectionIntro
        eyebrow="Inicio"
        title="Partidos del Mundial"
        description="Consulta, predice y compite en tiempo real."
      />

      <div className="space-y-3">
        <p className="text-xs uppercase text-slate-400">Grupos</p>

        <div className="grid grid-cols-2 gap-2">
          {mockGroups.map((group) => (
            <GroupCard key={group.group} group={group} />
          ))}
        </div>
      </div>

      {/* 🔥 PARTIDO DESTACADO */}
      {cupData.loading ? (
        <LoadingCard />
      ) : nextMatch ? (
        <div>
          <p className="mb-2 text-xs uppercase tracking-[0.2em] text-slate-400">Próximo partido</p>
          <MatchCard item={nextMatch} />
        </div>
      ) : (
        <EmptyState
          title="No hay partidos"
          description="Cuando haya partidos disponibles, aparecerán aquí."
        />
      )}

      {/* 🔥 LISTA CORTA */}
      {!cupData.loading && nextMatches.length > 0 && (
        <div className="space-y-3">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Más partidos</p>

          {nextMatches.map((item) => (
            <MatchCard key={item.match.id} item={item} />
          ))}
        </div>
      )}

      {/* 🔥 CTA */}
      {!cupData.loading && upcomingMatches.length > 4 && (
        <Link
          to="/cup/home"
          className="block w-full text-center rounded-xl bg-tonner-blue py-3 text-sm font-medium text-white"
        >
          Ver todos los partidos
        </Link>
      )}
    </section>
  );
}

export default HomePage;
