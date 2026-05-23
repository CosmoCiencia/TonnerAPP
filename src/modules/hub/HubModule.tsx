import { useEffect, useMemo, useState, type ChangeEvent, type FormEvent } from 'react'

import LegalTermsContent from '../../components/LegalTermsContent'
import { getProducts } from '../catalog/services'
import type { Product } from '../catalog/types'
import { useAuth } from '../../auth/useAuth'
import { getOptimizedImageSrc } from '../../services/imageAssets'

export type HubView = 'home' | 'work' | 'favorites' | 'calculator' | 'profile'
type ProfilePanel = 'distributor' | 'data' | 'preferences' | 'terms' | 'support'

type HubProfileDraft = {
  fullName: string
  email: string
  phone: string
  city: string
  avatar: string
}

type HubCard = {
  key: string
  title: string
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
    image: '/PORTAFOLIO.webp',
    variant: 'portfolio',
  },
  {
    key: 'paint',
    title: 'TONNER PAINT',
    image: '/TONNER PAINT.webp',
    variant: 'paint',
  },
  {
    key: 'stores',
    title: 'PUNTOS DE VENTA',
    image: '/PUNTOS DE VENTA.webp',
    variant: 'stores',
  },
  {
    key: 'cup',
    title: 'POLLAMUNDIALISTA',
    image: '/FONDO POLLATONNER GRUPOS.webp',
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
  { label: 'Actualizar datos y foto', panel: 'data' },
  { label: 'Términos y Condiciones', panel: 'terms' },
  { label: 'Preferencias', panel: 'preferences' },
  { label: 'Atención al Cliente', panel: 'support' },
]

const HUB_PROFILE_STORAGE_KEY = 'tonnerapp-hub-profile'

const getUserProfileStorageKey = (userId: string) => `tonnerapp-profile-${userId}`

const loadHubProfile = (userId?: string, fullName?: string, email?: string): HubProfileDraft => {
  const fallbackProfile = {
    fullName: fullName ?? 'Usuario Tonner',
    email: email ?? '',
    phone: '',
    city: 'Soacha',
    avatar: '',
  }

  try {
    const rawProfile = userId
      ? window.localStorage.getItem(getUserProfileStorageKey(userId)) ?? window.localStorage.getItem(HUB_PROFILE_STORAGE_KEY)
      : window.localStorage.getItem(HUB_PROFILE_STORAGE_KEY)
    const parsedProfile = rawProfile ? (JSON.parse(rawProfile) as Partial<HubProfileDraft>) : null

    return {
      fullName: parsedProfile?.fullName ?? fallbackProfile.fullName,
      email: parsedProfile?.email ?? fallbackProfile.email,
      phone: parsedProfile?.phone ?? fallbackProfile.phone,
      city: parsedProfile?.city ?? fallbackProfile.city,
      avatar: parsedProfile?.avatar ?? '',
    }
  } catch {
    return fallbackProfile
  }
}

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

        return (
          <button
            key={card.key}
            type="button"
            className={`hub-card hub-card--${card.variant}`}
            onClick={openInternalModule ?? undefined}
            disabled={!openInternalModule}
          >
            <img src={getOptimizedImageSrc(card.image)} alt="" className="hub-card__image" decoding="async" />
            <span className="hub-card__title">{card.title}</span>
          </button>
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
  const auth = useAuth()
  const [internalActiveView, setInternalActiveView] = useState<HubView>(() => getInitialView())
  const activeView = controlledActiveView ?? internalActiveView
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [profilePanel, setProfilePanel] = useState<ProfilePanel | null>(null)
  const [profileFeedback, setProfileFeedback] = useState('')
  const [hubProfile, setHubProfile] = useState<HubProfileDraft>(() =>
    loadHubProfile(auth.user?.id, auth.user?.fullName, auth.user?.email),
  )
  const [products, setProducts] = useState<Product[]>([])
  const [productSearch, setProductSearch] = useState('')
  const profileFirstName = hubProfile.fullName.trim().split(/\s+/)[0] || 'Perfil'

  useEffect(() => {
    getProducts().then(setProducts)
  }, [])

  const searchResults = useMemo(() => {
    const normalizedSearch = productSearch.trim().toLowerCase()

    if (normalizedSearch.length < 2) return []

    return products
      .filter((product) => {
        const searchableText = [
          product.name,
          product.line,
          product.category,
          product.subline,
          product.segment,
          product.description,
          product.short_description,
          ...(product.uses ?? []),
          ...(product.characteristics ?? []),
          ...(product.presentations ?? []),
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase()

        return searchableText.includes(normalizedSearch)
      })
      .slice(0, 6)
  }, [productSearch, products])

  const handleOpenProductResult = () => {
    setProductSearch('')
    onOpenCatalog?.()
  }

  const openProfileOptions = () => {
    setProductSearch('')
    setProfilePanel(null)
    setProfileFeedback('')
    selectView('profile')
  }

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
    window.localStorage.setItem(HUB_PROFILE_STORAGE_KEY, JSON.stringify(hubProfile))
    setProfileFeedback(message)
  }

  const handleHubAvatarChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.addEventListener('load', () => {
      setHubProfile((current) => ({
        ...current,
        avatar: typeof reader.result === 'string' ? reader.result : '',
      }))
    })
    reader.readAsDataURL(file)
  }

  const renderProfilePanel = () => {
    if (!profilePanel) return null

    if (profilePanel === 'distributor') {
      return (
        <section className="hub-profile-detail" aria-label="Vincular distribuidora">
          <h1>Vincular Distribuidora</h1>
          <form onSubmit={handleProfileSubmit('Distribuidora vinculada.')}>
            <label>
              <span>NIT o código</span>
              <input placeholder="Ingresa el NIT o código" />
            </label>
            <label>
              <span>Nombre distribuidora</span>
              <input placeholder="Nombre de la distribuidora" />
            </label>
            <button type="submit">Guardar vinculación</button>
          </form>
        </section>
      )
    }

    if (profilePanel === 'data') {
      return (
        <section className="hub-profile-detail" aria-label="Mis datos">
          <h1>Actualizar datos</h1>
          <form onSubmit={handleProfileSubmit('Datos actualizados.')}>
            <div className="hub-profile-photo-row">
              <div className="hub-profile-avatar hub-profile-avatar--small">
                {hubProfile.avatar ? <img src={hubProfile.avatar} alt="" /> : null}
              </div>
              <label className="hub-profile-photo-button">
                <span>Cambiar foto</span>
                <input type="file" accept="image/*" onChange={handleHubAvatarChange} />
              </label>
            </div>
            <label>
              <span>Nombre</span>
              <input
                value={hubProfile.fullName}
                onChange={(event) => setHubProfile((current) => ({ ...current, fullName: event.target.value }))}
              />
            </label>
            <label>
              <span>Correo</span>
              <input
                value={hubProfile.email}
                type="email"
                onChange={(event) => setHubProfile((current) => ({ ...current, email: event.target.value }))}
              />
            </label>
            <label>
              <span>Teléfono</span>
              <input
                value={hubProfile.phone}
                inputMode="tel"
                onChange={(event) => setHubProfile((current) => ({ ...current, phone: event.target.value }))}
              />
            </label>
            <label>
              <span>Ciudad</span>
              <input
                value={hubProfile.city}
                onChange={(event) => setHubProfile((current) => ({ ...current, city: event.target.value }))}
              />
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
          <LegalTermsContent />
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
          <div className="hub-profile-avatar">
            {hubProfile.avatar ? <img src={hubProfile.avatar} alt="" /> : null}
          </div>
          <strong>{hubProfile.fullName}</strong>
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
        <img
          src={getOptimizedImageSrc('/logo.webp')}
          alt="Pinturas Tonner"
          className="hub-header__logo"
          decoding="async"
        />
        <button
          type="button"
          className="hub-header__bell"
          aria-label="Notificaciones"
          aria-expanded={notificationsOpen}
          onClick={() => setNotificationsOpen((open) => !open)}
        >
          <img src="/campana icon.png" alt="" className="hub-header__bell-icon" />
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
          <div className="hub-search-row">
            <label className="hub-search">
              <img src="/icons/LUPA.png" alt="" className="hub-search__icon" />
              <input
                type="search"
                placeholder="Qué vas a pintar hoy?"
                value={productSearch}
                onChange={(event) => setProductSearch(event.target.value)}
              />
            </label>
            <button
              type="button"
              className="hub-search-profile"
              aria-label="Abrir opciones de perfil"
              onClick={openProfileOptions}
            >
              <span className="hub-search-avatar" aria-hidden="true">
                <img src={hubProfile.avatar || '/icons/PERFIL.png'} alt="" />
              </span>
              <span className="hub-search-profile__name">{profileFirstName}</span>
            </button>
          </div>
        ) : null}

        {activeView === 'home' && productSearch.trim().length >= 2 ? (
          <section className="hub-search-results" aria-label="Resultados de productos">
            {searchResults.length > 0 ? (
              searchResults.map((product) => (
                <button
                  key={product.id}
                  type="button"
                  className="hub-search-result"
                  onClick={handleOpenProductResult}
                >
                  <img
                    src={getOptimizedImageSrc(product.image_url ?? product.image ?? '/PORTAFOLIO.webp')}
                    alt=""
                    decoding="async"
                  />
                  <span>
                    <strong>{product.name}</strong>
                    <small>{[product.line, product.category].filter(Boolean).join(' · ')}</small>
                  </span>
                </button>
              ))
            ) : (
              <div className="hub-search-empty">
                <strong>Sin resultados</strong>
                <span>Prueba con el nombre del producto, línea o uso.</span>
              </div>
            )}
          </section>
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
