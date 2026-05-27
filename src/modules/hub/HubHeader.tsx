import { getOptimizedImageSrc } from '../../services/imageAssets'

export default function HubHeader({
  notificationsOpen,
  onBack,
  onToggleNotifications,
}: {
  notificationsOpen: boolean
  onBack: () => void
  onToggleNotifications: () => void
}) {
  return (
    <header className="hub-header">
      <button type="button" className="hub-header__back" aria-label="Regresar" onClick={onBack}>
        <img src="/icons/boton regreso.png" alt="" />
      </button>
      <img
        src={getOptimizedImageSrc('/brand/logo.webp')}
        alt="Pinturas Tonner"
        className="hub-header__logo"
        decoding="async"
      />
      <button
        type="button"
        className="hub-header__bell"
        aria-label="Notificaciones"
        aria-expanded={notificationsOpen}
        onClick={onToggleNotifications}
      >
        <img src="/shared/campana-icon.png" alt="" className="hub-header__bell-icon" />
      </button>
      {notificationsOpen ? (
        <aside className="hub-notifications" aria-label="Notificaciones">
          <strong>Notificaciones</strong>
          <span>Nuevo producto publicado en Portafolio.</span>
          <span>Stock disponible para un favorito.</span>
          <span>Puntaje actualizado en Pollamundialista.</span>
        </aside>
      ) : null}
    </header>
  )
}
