import { Megaphone } from 'lucide-react';
import { Link } from 'react-router-dom';

import { useAppContent } from '../../../services/appContent';
import { getOptimizedImageSrc } from '../../../services/imageAssets';

const items = [
  {
    title: 'Fase de grupos',
    to: '/cup/home',
  },
  {
    title: 'Dieciseisavos',
    to: '/cup/predictions',
  },
  {
    title: 'Octavos',
    to: '/cup/results',
  },
  {
    title: 'Cuartos',
    to: '/cup/ranking',
  },
  {
    title: 'Semifinal',
    to: '/cup/ranking',
  },
  {
    title: 'Final',
    to: '/cup/ranking',
  },
];

function DashboardPage() {
  const appContent = useAppContent();
  const launch = appContent.cup.launch;

  return (
    <section className="cup-launch" aria-label="Polla Mundialista Tonner">
      <header className="cup-launch-header">
        <button className="cup-header-icon" type="button" aria-label="Anuncios">
          <Megaphone size={27} strokeWidth={3} />
        </button>
        <img
          src={getOptimizedImageSrc('/logo.png')}
          alt="Pinturas Tonner"
          className="cup-launch-logo"
          decoding="async"
        />
        <button className="cup-header-icon" type="button" aria-label="Notificaciones">
          <img src="/campana icon.png" alt="" className="cup-header-icon__image" />
        </button>
      </header>

      <div className="cup-launch-hero">
        <img src={getOptimizedImageSrc(launch.backgroundImage)} alt="" className="cup-launch-bg" decoding="async" />
        <div className="cup-launch-copy cup-launch-copy-top">
          <span>{launch.topLine}</span>
          <strong>{launch.title}</strong>
        </div>
        <img
          src={getOptimizedImageSrc(launch.trophyImage)}
          alt="Copa Mundial"
          className="cup-launch-trophy"
          decoding="async"
        />
        <div className="cup-launch-copy cup-launch-copy-bottom">
          <span>{launch.bottomLine}</span>
          <strong>{launch.brand}</strong>
        </div>
      </div>

      <nav className="cup-stage-grid" aria-label="Fases del mundial">
        {items.map(({ title, to }) => (
          <Link
            key={title}
            to={to}
            className="cup-stage-button"
          >
            {title}
          </Link>
        ))}
      </nav>
    </section>
  );
}

export default DashboardPage;
