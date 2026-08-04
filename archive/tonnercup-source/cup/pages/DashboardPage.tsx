import { Gift, Heart, Target, Trophy } from 'lucide-react';
import { Link } from 'react-router-dom';

import { useAppContent } from '../../../services/appContent';
import { getOptimizedImageSrc } from '../../../services/imageAssets';

const items = [
  {
    title: 'Partidos',
    description: 'Calendario y jornadas',
    to: '/cup/stage/todos',
    icon: Trophy,
  },
  {
    title: 'Predicciones',
    description: 'Marca tus resultados',
    to: '/cup/predictions',
    icon: Target,
  },
  {
    title: 'Puntajes',
    description: 'Ranking de jugadores',
    to: '/cup/ranking',
    icon: Heart,
  },
  {
    title: 'Premios y condiciones',
    description: 'Reglas de puntuación',
    to: '/cup/rules',
    icon: Gift,
  },
];

function DashboardPage() {
  const appContent = useAppContent();
  const launch = appContent.cup.launch;

  return (
    <section className="cup-launch" aria-label="Polla Tonner">
      <div className="cup-launch-hero">
        <img src={getOptimizedImageSrc(launch.backgroundImage)} alt="" className="cup-launch-bg" decoding="async" />
        <div className="cup-launch-copy cup-launch-copy-top">
          <span>{launch.topLine}</span>
          <strong>{launch.title}</strong>
        </div>
        <img
          src={getOptimizedImageSrc(launch.trophyImage)}
          alt="Balón Polla Tonner"
          className="cup-launch-symbol"
          decoding="async"
        />
        <div className="cup-launch-copy cup-launch-copy-bottom">
          <span>{launch.bottomLine}</span>
          <strong>{launch.brand}</strong>
        </div>
      </div>

      <nav className="cup-menu-grid" aria-label="Opciones de TonnerCup">
        {items.map(({ title, description, to, icon: Icon }) => (
          <Link
            key={title}
            to={to}
            className="cup-menu-button"
          >
            <Icon size={25} strokeWidth={3} />
            <span>{title}</span>
            <small>{description}</small>
          </Link>
        ))}
      </nav>
    </section>
  );
}

export default DashboardPage;
