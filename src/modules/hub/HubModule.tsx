import { useState, type FormEvent } from 'react'
import { Bell } from 'lucide-react'

export type HubView = 'home' | 'work' | 'favorites' | 'calculator' | 'profile'
type ProfilePanel = 'distributor' | 'data' | 'preferences' | 'terms' | 'support'

type HubCard = {
  key: string
  title: string
  href: string
  image: string
  variant: 'portfolio' | 'paint' | 'stores' | 'cup'
}

type HubModuleProps = {
  onOpenCatalog?: () => void
  onOpenCup?: () => void
  onOpenPaint?: () => void
  onOpenStores?: () => void
  activeView?: HubView
  onViewChange?: (view: HubView) => void
  showBottomNav?: boolean
}

const isLocalHost = ['localhost', '127.0.0.1', '0.0.0.0'].includes(window.location.hostname)

const productionAppLinks = {
  catalog: 'https://tonner-catalog.vercel.app/',
  paint: 'https://tonner-paint.vercel.app/',
  cup: 'https://tonner-cup.vercel.app/',
}

const resolveAppLink = (configuredUrl: string | undefined, productionUrl: string) => {
  if (!configuredUrl) return productionUrl

  const pointsToLocalPort =
    configuredUrl.includes('localhost') ||
    configuredUrl.includes('127.0.0.1') ||
    configuredUrl.includes('0.0.0.0')

  if (!isLocalHost && pointsToLocalPort) return productionUrl

  return configuredUrl
}

const appLinks = {
  catalog: resolveAppLink(import.meta.env.VITE_TONNER_CATALOG_URL, productionAppLinks.catalog),
  paint: resolveAppLink(import.meta.env.VITE_TONNER_PAINT_URL, productionAppLinks.paint),
  cup: resolveAppLink(import.meta.env.VITE_TONNER_CUP_URL, productionAppLinks.cup),
}

const withCatalogSection = (view: string, params: Record<string, string> = {}) => {
  const url = new URL(appLinks.catalog)
  url.searchParams.set('view', view)

  Object.entries(params).forEach(([key, value]) => {
    url.searchParams.set(key, value)
  })

  return url.toString()
}

const getInitialView = (): HubView => {
  const view = new URLSearchParams(window.location.search).get('view')

  if (view === 'work' || view === 'favorites' || view === 'calculator' || view === 'profile') {
    return view
  }

  return 'home'
}

const hubCards: HubCard[] = [
  {
    key: 'portfolio',
    title: 'PORTAFOLIO',
    href: appLinks.catalog,
    image: '/PORTAFOLIO.png',
    variant: 'portfolio',
  },
  {
    key: 'paint',
    title: 'TONNER PAINT',
    href: appLinks.paint,
    image: '/TONNER PAINT.png',
    variant: 'paint',
  },
  {
    key: 'stores',
    title: 'PUNTOS DE VENTA',
    href: withCatalogSection('stores', { mode: 'map' }),
    image: '/PUNTOS DE VENTA.png',
    variant: 'stores',
  },
  {
    key: 'cup',
    title: 'POLLAMUNDIALISTA',
    href: appLinks.cup,
    image: '/FONDO POLLATONNER GRUPOS.png',
    variant: 'cup',
  },
]

const navItems = [
  { label: 'Inicio', icon: '/icons/INICIO.png', view: 'home' },
  { label: 'Trabajo', icon: '/icons/TRABAJO.png', view: 'work' },
  { label: 'Favoritos', icon: '/icons/FAVORITOS.png', view: 'favorites' },
  { label: 'Calculadora', icon: '/icons/CALCULADORA.png', view: 'calculator' },
  { label: 'Perfil', icon: '/icons/PERFIL.png', view: 'profile' },
] satisfies Array<{
  label: string
  icon: string
  view: HubView
}>

const favoriteCards = hubCards.filter((card) => card.key === 'portfolio' || card.key === 'paint')

const workActions = [
  { label: 'Repinte automotriz', tag: 'Automotriz', place: 'Bogotá', phone: '320 000 0000' },
  { label: 'Pintor arquitectónico', tag: 'Arquitectónica', place: 'Medellín', phone: '315 000 0000' },
  { label: 'Equipo para obra', tag: 'Construcción', place: 'Cali', phone: '311 000 0000' },
]

const profileOptions: Array<{ label: string; panel: ProfilePanel }> = [
  { label: 'Mis Datos', panel: 'data' },
  { label: 'Preferencias', panel: 'preferences' },
  { label: 'Términos y Condiciones', panel: 'terms' },
  { label: 'Atención al Cliente', panel: 'support' },
]

function HubCardsInternal({
  cards,
  onOpenCatalog,
  onOpenCup,
  onOpenPaint,
  onOpenStores,
}: {
  cards: HubCard[]
  onOpenCatalog?: () => void
  onOpenCup?: () => void
  onOpenPaint?: () => void
  onOpenStores?: () => void
}) {
  return (
    <div className="hub-cards" aria-label="Secciones principales">
      {cards.map((card) => {
        const openInternalModule =
          card.key === 'portfolio'
            ? onOpenCatalog
            : card.key === 'stores'
              ? onOpenStores
              : card.key === 'paint'
                ? onOpenPaint
                : card.key === 'cup'
                  ? onOpenCup
                  : null

        if (openInternalModule) {
          return (
            <button
              key={card.key}
              type="button"
              className={`hub-card hub-card--${card.variant}`}
              onClick={openInternalModule}
            >
              <img src={card.image} alt="" className="hub-card__image" />
              <span className="hub-card__title">{card.title}</span>
            </button>
          )
        }

        return (
          <a key={card.key} href={card.href} className={`hub-card hub-card--${card.variant}`}>
            <img src={card.image} alt="" className="hub-card__image" />
            <span className="hub-card__title">{card.title}</span>
          </a>
        )
      })}
    </div>
  )
}

export function HubModule({
  onOpenCatalog,
  onOpenCup,
  onOpenPaint,
  onOpenStores,
  activeView: controlledActiveView,
  onViewChange,
  showBottomNav = true,
}: HubModuleProps) {
  const [internalActiveView, setInternalActiveView] = useState<HubView>(() => getInitialView())
  const activeView = controlledActiveView ?? internalActiveView
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [profilePanel, setProfilePanel] = useState<ProfilePanel | null>(null)
  const [profileFeedback, setProfileFeedback] = useState('')

  const selectView = (view: HubView) => {
    setNotificationsOpen(false)
    setProfilePanel(null)
    setProfileFeedback('')
    if (onViewChange) {
      onViewChange(view)
    } else {
      setInternalActiveView(view)
    }

    const nextUrl = view === 'home' ? window.location.pathname : `${window.location.pathname}?view=${view}`
    window.history.replaceState(null, '', nextUrl)
  }

  const handleBack = () => {
    setNotificationsOpen(false)

    if (profilePanel) {
      setProfilePanel(null)
      setProfileFeedback('')
      return
    }

    if (activeView !== 'home') {
      selectView('home')
      return
    }

    if (window.history.length > 1) {
      window.history.back()
    }
  }

  const handleProfileSubmit = (message: string) => (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setProfileFeedback(message)
  }

  const renderProfilePanel = () => {
    if (!profilePanel) return null

    if (profilePanel === 'distributor') {
      return (
        <section className="hub-profile-detail" aria-label="Vincular distribuidora">
          <h1>Vincular Distribuidora</h1>
          <form onSubmit={handleProfileSubmit('Distribuidora vinculada para demo.')}>
            <label>
              <span>NIT o código</span>
              <input defaultValue="TONNER-DEMO-001" />
            </label>
            <label>
              <span>Nombre distribuidora</span>
              <input defaultValue="Distribuidora Demo Tonner" />
            </label>
            <button type="submit">Guardar vinculación</button>
          </form>
        </section>
      )
    }

    if (profilePanel === 'data') {
      return (
        <section className="hub-profile-detail" aria-label="Mis datos">
          <h1>Mis Datos</h1>
          <form onSubmit={handleProfileSubmit('Datos actualizados para demo.')}>
            <label>
              <span>Nombre</span>
              <input defaultValue="Usuario demo" />
            </label>
            <label>
              <span>Correo</span>
              <input defaultValue="demo@pinturastonner.com" type="email" />
            </label>
            <label>
              <span>Teléfono</span>
              <input defaultValue="300 000 0000" inputMode="tel" />
            </label>
            <button type="submit">Guardar cambios</button>
          </form>
        </section>
      )
    }

    if (profilePanel === 'preferences') {
      return (
        <section className="hub-profile-detail" aria-label="Preferencias">
          <h1>Preferencias</h1>
          <div className="hub-preference-list">
            {['Notificaciones de productos', 'Alertas de stock', 'Actualizaciones Pollamundialista'].map((item) => (
              <label key={item} className="hub-preference-toggle">
                <span>{item}</span>
                <input type="checkbox" defaultChecked />
              </label>
            ))}
          </div>
        </section>
      )
    }

    if (profilePanel === 'support') {
      return (
        <section className="hub-profile-detail" aria-label="Atención al cliente">
          <h1>Atención al Cliente</h1>
          <div className="hub-support-actions">
            <a href="tel:+573000000000">Llamar a Tonner</a>
            <a href="mailto:servicioalcliente@pinturastonner.com">Enviar correo</a>
            <a href="https://wa.me/573000000000">WhatsApp</a>
          </div>
        </section>
      )
    }

    return (
      <section className="hub-profile-detail" aria-label="Términos y condiciones">
        <h1>Términos y Condiciones</h1>
        <div className="hub-terms-box">
          <p>
            El uso de TonnerHub permite consultar productos, campañas, favoritos, servicios y enlaces del
            ecosistema digital de Pinturas Tonner.
          </p>
          <p>
            La información de cuenta se usa para personalizar la experiencia, notificaciones y vinculación con
            distribuidoras autorizadas.
          </p>
        </div>
      </section>
    )
  }

  const renderContent = () => {
    if (activeView === 'home') {
      return (
        <HubCardsInternal
          cards={hubCards}
          onOpenCatalog={onOpenCatalog}
          onOpenCup={onOpenCup}
          onOpenPaint={onOpenPaint}
          onOpenStores={onOpenStores}
        />
      )
    }

    if (activeView === 'work') {
      return (
        <section className="hub-section" aria-label="Trabajo">
          <div className="hub-work-banner" aria-label="Servicios Tonner">
            <span>Conecta servicios, talleres y proyectos</span>
          </div>
          <div className="hub-filter-row" aria-label="Filtros de servicios">
            {['Pintor', 'Taller', 'Obra', 'Automotriz'].map((filter) => (
              <button key={filter} type="button">
                {filter}
              </button>
            ))}
          </div>
          <div className="hub-service-list">
            {workActions.map((action) => (
              <article key={action.label} className="hub-service-card">
                <div className="hub-service-card__media" />
                <div>
                  <strong>{action.label}</strong>
                  <span>{action.tag}</span>
                  <small>{action.place} · {action.phone}</small>
                </div>
              </article>
            ))}
          </div>
        </section>
      )
    }

    if (activeView === 'favorites') {
      return (
        <section className="hub-section" aria-label="Favoritos">
          <h1>Favoritos</h1>
          <div className="hub-favorites-note">
            <strong>Productos guardados</strong>
            <span>Los favoritos se administran desde Portafolio para consultar fichas, colores y características con más rapidez.</span>
          </div>
          <HubCardsInternal
            cards={favoriteCards}
            onOpenCatalog={onOpenCatalog}
            onOpenCup={onOpenCup}
            onOpenPaint={onOpenPaint}
            onOpenStores={onOpenStores}
          />
        </section>
      )
    }

    if (activeView === 'calculator') {
      return (
        <section className="hub-section" aria-label="Calculadora">
          <h1>Calculadora</h1>
          <div className="hub-unavailable">
            <img src="/icons/CALCULADORA.png" alt="" />
            <strong>Módulo no incluido</strong>
            <span>El acceso queda reservado en la navegación, sin desarrollo funcional dentro de este alcance.</span>
          </div>
        </section>
      )
    }

    if (activeView === 'profile' && profilePanel) {
      return (
        <main className="hub-profile-screen hub-profile-screen--detail" aria-label="Perfil">
          {renderProfilePanel()}
          {profileFeedback ? <p className="hub-profile-feedback">{profileFeedback}</p> : null}
        </main>
      )
    }

    return (
      <main className="hub-profile-screen" aria-label="Perfil">
        <section className="hub-profile-hero">
          <div className="hub-profile-avatar" />
          <strong>Usuario Demo</strong>
        </section>

        <button className="hub-profile-link" type="button" onClick={() => setProfilePanel('distributor')}>
          Vincular Distribuidora
        </button>

        <h1>CONFIGURACIÓN</h1>

        {profileOptions.map((item, index) => (
          <button
            key={`${item.label}-${index}`}
            className="hub-profile-option"
            type="button"
            onClick={() => {
              setProfilePanel(item.panel)
              setProfileFeedback('')
            }}
          >
            {item.label}
          </button>
        ))}
      </main>
    )
  }

  return (
    <main className="hub-shell">
      <header className="hub-header">
        <button type="button" className="hub-header__back" aria-label="Regresar" onClick={handleBack}>
          <img src="/icons/boton regreso.png" alt="" />
        </button>
        <img src="/logo.png" alt="Pinturas Tonner" className="hub-header__logo" />
        <button
          type="button"
          className="hub-header__bell"
          aria-label="Notificaciones"
          aria-expanded={notificationsOpen}
          onClick={() => setNotificationsOpen((open) => !open)}
        >
          <Bell className="hub-header__bell-icon" />
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

      <section
        className={`hub-content ${activeView === 'profile' ? 'hub-content--profile' : ''}`}
        aria-label="TonnerHub"
      >
        {activeView === 'home' ? (
          <label className="hub-search">
            <img src="/icons/LUPA.png" alt="" className="hub-search__icon" />
            <input type="search" placeholder="Qué vas a pintar hoy?" />
          </label>
        ) : null}

        {renderContent()}
      </section>

      {showBottomNav ? (
        <nav className="hub-bottom-nav" aria-label="Navegacion principal">
          {navItems.map((item) => (
            <button
              key={item.label}
              type="button"
              className={`hub-bottom-nav__item ${activeView === item.view ? 'is-active' : ''}`}
              aria-label={item.label}
              aria-pressed={activeView === item.view}
              onClick={() => selectView(item.view)}
            >
              <img src={item.icon} alt="" className="hub-bottom-nav__icon" />
            </button>
          ))}
        </nav>
      ) : null}
    </main>
  )
}
