import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import { getOptimizedImageSrc } from '../../../services/imageAssets';

function CupTopBar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const handleBack = () => {
    setNotificationsOpen(false);

    if (location.pathname === '/cup' || location.pathname === '/cup/') {
      navigate('/');
      return;
    }

    navigate('/cup');
  };

  return (
    <header className="cup-topbar">
      <button type="button" className="cup-topbar__back" aria-label="Regresar" onClick={handleBack}>
        <img src="/icons/boton regreso.png" alt="" />
      </button>

      <img
        src={getOptimizedImageSrc('/logo.webp')}
        alt="Pinturas Tonner"
        className="cup-topbar__logo"
        decoding="async"
      />

      <button
        type="button"
        className="cup-topbar__bell"
        aria-label="Notificaciones"
        aria-expanded={notificationsOpen}
        onClick={() => setNotificationsOpen((open) => !open)}
      >
        <img src="/campana icon.png" alt="" className="cup-topbar__bell-icon" />
      </button>

      {notificationsOpen ? (
        <aside className="cup-topbar__notifications" aria-label="Notificaciones">
          <strong>Notificaciones</strong>
          <span>Recuerda guardar tus predicciones antes de cada partido.</span>
          <span>El ranking se actualizará cuando haya resultados oficiales.</span>
        </aside>
      ) : null}
    </header>
  );
}

export default CupTopBar;
