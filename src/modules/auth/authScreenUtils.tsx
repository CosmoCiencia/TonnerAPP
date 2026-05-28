import { useState, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'

import { getOptimizedImageSrc } from '../../services/imageAssets'

export function AuthShell({
  children,
  eyebrow,
  title,
  description,
  showTopBar = false,
  showHeaderLogo = true,
}: {
  children: ReactNode
  eyebrow: string
  title: string
  description: string
  showTopBar?: boolean
  showHeaderLogo?: boolean
}) {
  return (
    <main className="auth-screen">
      <section className={`auth-device${showTopBar ? ' auth-device--with-topbar' : ''}`}>
        {showTopBar ? <AuthTopBar /> : null}
        <header className="auth-header">
          {showHeaderLogo ? (
            <img src={getOptimizedImageSrc('/brand/logo.webp')} alt="Pinturas Tonner" decoding="async" />
          ) : null}
          <span>{eyebrow}</span>
          <h1>{title}</h1>
          <p>{description}</p>
        </header>
        {children}
      </section>
    </main>
  )
}

function AuthTopBar() {
  const navigate = useNavigate()
  const [notificationsOpen, setNotificationsOpen] = useState(false)

  const handleBack = () => {
    setNotificationsOpen(false)
    navigate('/')
  }

  return (
    <header className="auth-topbar">
      <button type="button" className="auth-topbar__back" aria-label="Regresar" onClick={handleBack}>
        <img src="/icons/boton regreso.png" alt="" />
      </button>

      <img
        src={getOptimizedImageSrc('/brand/logo.webp')}
        alt="Pinturas Tonner"
        className="auth-topbar__logo"
        decoding="async"
      />

      <button
        type="button"
        className="auth-topbar__bell"
        aria-label="Notificaciones"
        aria-expanded={notificationsOpen}
        onClick={() => setNotificationsOpen((open) => !open)}
      >
        <img src="/shared/campana-icon.png" alt="" />
      </button>

      {notificationsOpen ? (
        <aside className="auth-topbar__notifications" aria-label="Notificaciones">
          <strong>Notificaciones</strong>
          <span>Inicia sesión para entrar a TonnerCup y guardar tus pronósticos.</span>
        </aside>
      ) : null}
    </header>
  )
}
