import { Suspense, lazy, useEffect, useState } from 'react'
import { App as CapacitorApp } from '@capacitor/app'
import { Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom'

import type { CatalogView } from './modules/catalog/CatalogModule'
import type { HubView } from './modules/hub'
import type { Product } from './modules/catalog/types'
import type { Distributor } from './modules/distributors/types'
import { RequireAuth, RequireRole } from './auth/auth.guards'
import { privateRoles } from './auth/roleAccess'
import { PASSWORD_RECOVERY_LINK_EVENT, establishPasswordRecoverySessionFromUrl } from './auth/auth.service'
import { getOptimizedImageSrc } from './services/imageAssets'

const HubModule = lazy(() => import('./modules/hub').then((module) => ({ default: module.HubModule })))
const CatalogModule = lazy(() => import('./modules/catalog/CatalogModule'))
const CupModule = lazy(() => import('./modules/cup/CupModule'))
const PaintModule = lazy(() => import('./modules/paint/PaintModule'))
const AccessDeniedScreen = lazy(() =>
  import('./modules/auth/AuthScreens').then((module) => ({ default: module.AccessDeniedScreen })),
)
const InternalToolsScreen = lazy(() =>
  import('./modules/auth/AuthScreens').then((module) => ({ default: module.InternalToolsScreen })),
)
const LoginScreen = lazy(() => import('./modules/auth/AuthScreens').then((module) => ({ default: module.LoginScreen })))
const ForgotPasswordScreen = lazy(() =>
  import('./modules/auth/AuthScreens').then((module) => ({ default: module.ForgotPasswordScreen })),
)
const PendingApprovalScreen = lazy(() =>
  import('./modules/auth/AuthScreens').then((module) => ({ default: module.PendingApprovalScreen })),
)
const ProfileScreen = lazy(() =>
  import('./modules/auth/AuthScreens').then((module) => ({ default: module.ProfileScreen })),
)
const RegisterScreen = lazy(() =>
  import('./modules/auth/AuthScreens').then((module) => ({ default: module.RegisterScreen })),
)
const ResetPasswordScreen = lazy(() =>
  import('./modules/auth/AuthScreens').then((module) => ({ default: module.ResetPasswordScreen })),
)

type GlobalNavKey = 'home' | 'work' | 'favorites' | 'calculator' | 'profile'

const globalNavItems: Array<{ key: GlobalNavKey; label: string; icon: string; to: string }> = [
  { key: 'home', label: 'Inicio', icon: '/icons/INICIO.png', to: '/' },
  { key: 'work', label: 'Trabajo', icon: '/icons/TRABAJO.png', to: '/work' },
  { key: 'favorites', label: 'Favoritos', icon: '/icons/FAVORITOS.png', to: '/favorites' },
  { key: 'calculator', label: 'Calculadora', icon: '/icons/CALCULADORA.png', to: '/calculator' },
  { key: 'profile', label: 'Perfil', icon: '/icons/PERFIL.png', to: '/profile' },
]

const FAVORITES_STORAGE_KEY = 'tonnerapp-favorites-v1'
const LEGACY_PRODUCT_FAVORITES_KEY = 'tonnerapp-favorite-products'
const APP_LINK_HOST = 'tonner-app.vercel.app'
const CUSTOM_URL_SCHEME = 'com.tonner.tonnerapp:'

type StoredFavorites = {
  catalogProducts: string[]
  stores: string[]
}

const createEmptyFavorites = () => ({
  catalogProducts: new Set<string>(),
  stores: new Set<string>(),
})

const loadFavoriteIds = () => {
  try {
    const rawFavorites = window.localStorage.getItem(FAVORITES_STORAGE_KEY)
    const parsedFavorites = rawFavorites ? (JSON.parse(rawFavorites) as Partial<StoredFavorites>) : null

    if (parsedFavorites && typeof parsedFavorites === 'object') {
      return {
        catalogProducts: new Set(Array.isArray(parsedFavorites.catalogProducts) ? parsedFavorites.catalogProducts : []),
        stores: new Set(Array.isArray(parsedFavorites.stores) ? parsedFavorites.stores.map(String) : []),
      }
    }

    const legacyRawFavorites = window.localStorage.getItem(LEGACY_PRODUCT_FAVORITES_KEY)
    const legacyFavorites = legacyRawFavorites ? JSON.parse(legacyRawFavorites) : []

    return {
      catalogProducts: new Set(Array.isArray(legacyFavorites) ? legacyFavorites : []),
      stores: new Set<string>(),
    }
  } catch {
    return createEmptyFavorites()
  }
}

const persistFavoriteIds = (catalogProducts: Set<string>, stores: Set<string>) => {
  window.localStorage.setItem(
    FAVORITES_STORAGE_KEY,
    JSON.stringify({
      catalogProducts: Array.from(catalogProducts),
      stores: Array.from(stores),
    } satisfies StoredFavorites),
  )
}

const getAppPathFromUrl = (urlString: string) => {
  try {
    const url = new URL(urlString)

    if ((url.protocol === 'https:' || url.protocol === 'http:') && url.host === APP_LINK_HOST) {
      return `${url.pathname}${url.search}${url.hash}`
    }

    if (url.protocol === CUSTOM_URL_SCHEME) {
      const customPath = url.hostname ? `/${url.hostname}${url.pathname}` : url.pathname
      return `${customPath || '/'}${url.search}${url.hash}`
    }
  } catch (error) {
    console.error('[App links] No se pudo leer el enlace entrante:', error)
  }

  return null
}

const routeToHubView = (view: HubView) => {
  if (view === 'home') return '/'
  return `/${view}`
}

const pathToActiveGlobalKey = (pathname: string): GlobalNavKey | null => {
  if (pathname === '/') return 'home'
  if (pathname === '/work') return 'work'
  if (pathname === '/favorites') return 'favorites'
  if (pathname === '/calculator') return 'calculator'
  if (pathname === '/paint') return 'calculator'
  if (pathname === '/profile') return 'profile'
  return null
}

function Splash() {
  const [loadingPhase, setLoadingPhase] = useState<'intro' | 'exit' | 'done'>('intro')

  useEffect(() => {
    const exitTimer = window.setTimeout(() => {
      setLoadingPhase('exit')
    }, 1700)

    const doneTimer = window.setTimeout(() => {
      setLoadingPhase('done')
    }, 2450)

    return () => {
      window.clearTimeout(exitTimer)
      window.clearTimeout(doneTimer)
    }
  }, [])

  if (loadingPhase === 'done') return null

  return (
    <main
      className={`loading-screen ${loadingPhase === 'exit' ? 'is-exiting' : ''}`}
      aria-label="Cargando TonnerHub"
    >
      <img
        src={getOptimizedImageSrc('/hub/portada-carga.webp')}
        alt="Pinturas Tonner"
        className="loading-screen__image"
        decoding="async"
      />
      <div className="loading-screen__shine" aria-hidden="true" />
    </main>
  )
}

function RouteFallback() {
  return <div className="tonner-route-fallback" aria-hidden="true" />
}

function GlobalTopBar({
  notificationsOpen,
  onBack,
  onToggleNotifications,
}: {
  notificationsOpen: boolean
  onBack: () => void
  onToggleNotifications: () => void
}) {
  return (
    <header className="hub-header tonner-global-topbar">
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
          <span>Puntaje actualizado en Polla Tonner.</span>
        </aside>
      ) : null}
    </header>
  )
}

function HubRoute({ view }: { view: HubView }) {
  const navigate = useNavigate()

  return (
    <HubModule
      key={view}
      activeView={view}
      showBottomNav={false}
      onViewChange={(nextView) => navigate(routeToHubView(nextView))}
      onOpenCatalog={() => navigate('/catalog')}
      onOpenCup={() => navigate('/cup')}
      onOpenPaint={() => navigate('/paint')}
      onOpenStores={() => navigate('/stores')}
    />
  )
}

function CatalogRoute({
  view,
  favoriteProductIds,
  favoriteStoreIds,
  onToggleFavorite,
  onToggleStoreFavorite,
}: {
  view: CatalogView
  favoriteProductIds: Set<string>
  favoriteStoreIds: Set<string>
  onToggleFavorite: (product: Product) => void
  onToggleStoreFavorite: (distributor: Distributor) => void
}) {
  return (
    <CatalogModule
      key={`${view}-map`}
      initialView={view}
      initialStoresMode="map"
      favoriteProductIds={favoriteProductIds}
      favoriteStoreIds={favoriteStoreIds}
      onToggleFavorite={onToggleFavorite}
      onToggleStoreFavorite={onToggleStoreFavorite}
    />
  )
}

export default function AppShell() {
  const location = useLocation()
  const navigate = useNavigate()
  const [showSplash, setShowSplash] = useState(true)
  const [favoriteIds, setFavoriteIds] = useState(() => loadFavoriteIds())
  const [notificationsOpen, setNotificationsOpen] = useState(false)

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setShowSplash(false)
    }, 2450)

    return () => window.clearTimeout(timer)
  }, [])

  useEffect(() => {
    let isActive = true
    let removeListener: (() => void) | undefined

    void CapacitorApp.addListener('appUrlOpen', (event) => {
      const nextPath = getAppPathFromUrl(event.url)

      if (!nextPath) {
        return
      }

      void establishPasswordRecoverySessionFromUrl(event.url)
        .then((isRecoveryLink) => {
          if (isRecoveryLink) {
            window.dispatchEvent(new Event(PASSWORD_RECOVERY_LINK_EVENT))
          }
        })
        .catch((error) => {
          console.error('[Auth] No se pudo procesar el enlace de recuperación:', error)
        })

      navigate(nextPath, { replace: true })
    }).then((listener) => {
      if (!isActive) {
        void listener.remove()
        return
      }

      removeListener = () => {
        void listener.remove()
      }
    })

    return () => {
      isActive = false
      removeListener?.()
    }
  }, [navigate])

  const handleToggleFavorite = (product: Product) => {
    setFavoriteIds((currentFavorites) => {
      const nextProductFavorites = new Set(currentFavorites.catalogProducts)

      if (nextProductFavorites.has(product.id)) {
        nextProductFavorites.delete(product.id)
      } else {
        nextProductFavorites.add(product.id)
      }

      persistFavoriteIds(nextProductFavorites, currentFavorites.stores)

      return {
        catalogProducts: nextProductFavorites,
        stores: currentFavorites.stores,
      }
    })
  }

  const handleToggleStoreFavorite = (distributor: Distributor) => {
    setFavoriteIds((currentFavorites) => {
      const storeId = String(distributor.id)
      const nextStoreFavorites = new Set(currentFavorites.stores)

      if (nextStoreFavorites.has(storeId)) {
        nextStoreFavorites.delete(storeId)
      } else {
        nextStoreFavorites.add(storeId)
      }

      persistFavoriteIds(currentFavorites.catalogProducts, nextStoreFavorites)

      return {
        catalogProducts: currentFavorites.catalogProducts,
        stores: nextStoreFavorites,
      }
    })
  }

  const activeGlobalKey = pathToActiveGlobalKey(location.pathname)
  const isAuthRoute = [
    '/login',
    '/forgot-password',
    '/reset-password',
    '/register',
    '/pending-approval',
    '/access-denied',
    '/internal',
  ].some((path) => location.pathname.startsWith(path))
  const hideGlobalBottomNav = isAuthRoute

  const handleGlobalBack = () => {
    setNotificationsOpen(false)

    if (location.pathname.startsWith('/cup') && location.pathname !== '/cup' && location.pathname !== '/cup/') {
      navigate('/cup')
      return
    }

    if (location.pathname !== '/') {
      navigate('/')
      return
    }

    if (window.history.length > 1) {
      navigate(-1)
    }
  }

  if (showSplash) {
    return <Splash />
  }

  return (
    <>
      <Suspense fallback={<RouteFallback />}>
        <Routes>
          <Route path="/" element={<HubRoute view="home" />} />
          <Route path="/work" element={<HubRoute view="work" />} />
          <Route path="/calculator" element={<HubRoute view="calculator" />} />
          <Route path="/profile" element={<ProfileScreen />} />
          <Route path="/login" element={<LoginScreen />} />
          <Route path="/forgot-password" element={<ForgotPasswordScreen />} />
          <Route path="/reset-password" element={<ResetPasswordScreen />} />
          <Route path="/register" element={<RegisterScreen />} />
          <Route path="/pending-approval" element={<PendingApprovalScreen />} />
          <Route path="/access-denied" element={<AccessDeniedScreen />} />
          <Route
            path="/internal"
            element={
              <RequireRole roles={privateRoles}>
                <InternalToolsScreen />
              </RequireRole>
            }
          />
          <Route path="/paint" element={<PaintModule />} />
          <Route
            path="/cup/*"
            element={
              <RequireAuth>
                <CupModule />
              </RequireAuth>
            }
          />
          <Route
            path="/catalog"
            element={
              <CatalogRoute
                view="catalog"
                favoriteProductIds={favoriteIds.catalogProducts}
                favoriteStoreIds={favoriteIds.stores}
                onToggleFavorite={handleToggleFavorite}
                onToggleStoreFavorite={handleToggleStoreFavorite}
              />
            }
          />
          <Route
            path="/stores"
            element={
              <CatalogRoute
                view="stores"
                favoriteProductIds={favoriteIds.catalogProducts}
                favoriteStoreIds={favoriteIds.stores}
                onToggleFavorite={handleToggleFavorite}
                onToggleStoreFavorite={handleToggleStoreFavorite}
              />
            }
          />
          <Route
            path="/favorites"
            element={
              <RequireAuth>
                <CatalogRoute
                  view="favorites"
                  favoriteProductIds={favoriteIds.catalogProducts}
                  favoriteStoreIds={favoriteIds.stores}
                  onToggleFavorite={handleToggleFavorite}
                  onToggleStoreFavorite={handleToggleStoreFavorite}
                />
              </RequireAuth>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>

      <GlobalTopBar
        notificationsOpen={notificationsOpen}
        onBack={handleGlobalBack}
        onToggleNotifications={() => setNotificationsOpen((open) => !open)}
      />

      {hideGlobalBottomNav ? null : (
        <>
          <nav className="hub-bottom-nav tonner-global-nav" aria-label="Navegación principal">
            {globalNavItems.map((item) => (
              <button
                key={item.key}
                type="button"
                className={`hub-bottom-nav__item ${activeGlobalKey === item.key ? 'is-active' : ''}`}
                aria-label={item.label}
                aria-pressed={activeGlobalKey === item.key}
                onClick={() => {
                  setNotificationsOpen(false)
                  navigate(item.to)
                }}
              >
                <img src={item.icon} alt="" className="hub-bottom-nav__icon" />
              </button>
            ))}
          </nav>
        </>
      )}
    </>
  )
}
