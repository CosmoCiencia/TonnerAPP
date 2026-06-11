import { useEffect, useMemo, useState, type ChangeEvent, type FormEvent } from 'react'

import { getProducts } from '../catalog/services'
import type { Product } from '../catalog/types'
import { useAuth } from '../../auth/useAuth'
import HubCards from './HubCards'
import HubProfile from './HubProfile'
import HubSearch from './HubSearch'
import { favoriteCards, hubCards, navItems } from './hubData'
import type { HubProfileDraft, HubView, ProfilePanel } from './types'

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
  const [profilePanel, setProfilePanel] = useState<ProfilePanel | null>(null)
  const [profileFeedback, setProfileFeedback] = useState('')
  const [hubProfile, setHubProfile] = useState<HubProfileDraft>(() =>
    loadHubProfile(auth.user?.id, auth.user?.fullName, auth.user?.email),
  )
  const [products, setProducts] = useState<Product[]>([])
  const [productSearch, setProductSearch] = useState('')
  const [showScrollHint, setShowScrollHint] = useState(false)
  const profileFirstName = hubProfile.fullName.trim().split(/\s+/)[0] || 'Perfil'

  useEffect(() => {
    getProducts().then(setProducts)
  }, [])

  useEffect(() => {
    if (activeView !== 'home' || productSearch.trim()) {
      return
    }

    const updateScrollHint = () => {
      const canScroll = document.documentElement.scrollHeight - window.innerHeight > 12
      setShowScrollHint(canScroll && window.scrollY < 24)
    }

    const initialFrame = window.requestAnimationFrame(updateScrollHint)
    window.addEventListener('scroll', updateScrollHint, { passive: true })
    window.addEventListener('resize', updateScrollHint)

    return () => {
      window.cancelAnimationFrame(initialFrame)
      window.removeEventListener('scroll', updateScrollHint)
      window.removeEventListener('resize', updateScrollHint)
    }
  }, [activeView, productSearch])

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

  const renderComingSoon = ({
    title,
    icon,
    label,
    description,
  }: {
    title: string
    icon: string
    label: string
    description: string
  }) => (
    <section className="hub-section" aria-label={title}>
      <h1>{title}</h1>
      <div className="hub-unavailable">
        <img src={icon} alt="" />
        <strong>Muy pronto disponible</strong>
        <span>{label}</span>
        <p>{description}</p>
      </div>
    </section>
  )

  const renderContent = () => {
    if (activeView === 'home') {
      return (
        <HubCards
          cards={hubCards}
          onOpenCatalog={onOpenCatalog}
          onOpenCup={onOpenCup}
          onOpenPaint={onOpenPaint}
          onOpenStores={onOpenStores}
          showSocialLinks
        />
      )
    }

    if (activeView === 'work') {
      return renderComingSoon({
        title: 'Servicios Tonner',
        icon: '/icons/TRABAJO.png',
        label: 'Conecta servicios, talleres y proyectos',
        description:
          'Estamos preparando este espacio para publicar aliados, talleres y proyectos de forma organizada dentro de la app.',
      })
    }

    if (activeView === 'favorites') {
      return (
        <section className="hub-section" aria-label="Favoritos">
          <h1>Favoritos</h1>
          <div className="hub-favorites-note">
            <strong>Productos guardados</strong>
            <span>Los favoritos se administran desde Portafolio para consultar fichas, colores y características con más rapidez.</span>
          </div>
          <HubCards
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
      return renderComingSoon({
        title: 'Calculadora',
        icon: '/icons/CALCULADORA.png',
        label: 'Herramientas de cálculo Tonner',
        description:
          'Estamos preparando una calculadora para estimar cantidades y apoyar proyectos de pintura desde el celular.',
      })
    }

    return (
      <HubProfile
        hubProfile={hubProfile}
        profileFeedback={profileFeedback}
        profilePanel={profilePanel}
        onAvatarChange={handleHubAvatarChange}
        onProfileChange={setHubProfile}
        onProfileSubmit={handleProfileSubmit}
        onSelectPanel={(panel) => {
          setProfilePanel(panel)
          setProfileFeedback('')
        }}
      />
    )
  }

  const shouldShowScrollHint = activeView === 'home' && !productSearch.trim() && showScrollHint

  return (
    <main className="hub-shell">
      <section
        className={`hub-content ${activeView === 'profile' ? 'hub-content--profile' : ''}`}
        aria-label="TonnerHub"
      >
        {activeView === 'home' ? (
          <HubSearch
            profileAvatar={hubProfile.avatar}
            profileFirstName={profileFirstName}
            productSearch={productSearch}
            searchResults={searchResults}
            onOpenProductResult={handleOpenProductResult}
            onOpenProfileOptions={openProfileOptions}
            onSearchChange={setProductSearch}
          />
        ) : null}

        {renderContent()}
      </section>

      {shouldShowScrollHint ? (
        <div className="hub-scroll-hint" aria-hidden="true">
          <span />
        </div>
      ) : null}

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
