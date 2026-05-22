import { useState, type ChangeEvent, type FormEvent, type ReactNode } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'

import { useAuth } from '../../auth/useAuth'
import type { LoginInput } from '../../auth/auth.types'
import { getOptimizedImageSrc } from '../../services/imageAssets'
import LegalTermsContent from '../../components/LegalTermsContent'

type LocationState = {
  from?: {
    pathname?: string
  }
}

type EditableProfile = {
  fullName: string
  phone: string
  city: string
  avatar: string
}

type ProfilePanel = 'data' | 'distributor' | 'preferences' | 'terms' | 'support'

const getProfileStorageKey = (userId: string) => `tonnerapp-profile-${userId}`
const HUB_PROFILE_STORAGE_KEY = 'tonnerapp-hub-profile'

const loadEditableProfile = (userId: string | undefined, fullName: string | undefined): EditableProfile => {
  const fallbackProfile = {
    fullName: fullName ?? '',
    phone: '',
    city: '',
    avatar: '',
  }

  if (!userId) return fallbackProfile

  try {
    const rawProfile = window.localStorage.getItem(getProfileStorageKey(userId))
    const parsedProfile = rawProfile ? (JSON.parse(rawProfile) as Partial<EditableProfile>) : null

    return {
      fullName: parsedProfile?.fullName ?? fallbackProfile.fullName,
      phone: parsedProfile?.phone ?? '',
      city: parsedProfile?.city ?? '',
      avatar: parsedProfile?.avatar ?? '',
    }
  } catch {
    return fallbackProfile
  }
}

function getRedirectPath(state: unknown) {
  const locationState = state as LocationState | null
  return locationState?.from?.pathname ?? '/cup'
}

function AuthShell({
  children,
  eyebrow,
  title,
  description,
}: {
  children: ReactNode
  eyebrow: string
  title: string
  description: string
}) {
  return (
    <main className="auth-screen">
      <section className="auth-device">
        <header className="auth-header">
          <img src={getOptimizedImageSrc('/logo.webp')} alt="Pinturas Tonner" decoding="async" />
          <span>{eyebrow}</span>
          <h1>{title}</h1>
          <p>{description}</p>
        </header>
        {children}
      </section>
    </main>
  )
}

export function LoginScreen() {
  const auth = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [values, setValues] = useState<LoginInput>({ email: '', password: '' })
  const [errorMessage, setErrorMessage] = useState('')
  const redirectPath = getRedirectPath(location.state)

  const loginWith = async (input: LoginInput) => {
    setErrorMessage('')

    try {
      await auth.login(input)
      navigate(redirectPath, { replace: true })
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'No se pudo iniciar sesión.')
    }
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    await loginWith(values)
  }

  return (
    <AuthShell
      eyebrow="Acceso Tonner"
      title="Iniciar sesión"
      description="Entra para usar TonnerCup, ranking y funciones personalizadas."
    >
      <form className="auth-card" onSubmit={handleSubmit}>
        <label>
          <span>Correo</span>
          <input
            type="email"
            autoComplete="email"
            value={values.email}
            onChange={(event) => setValues((current) => ({ ...current, email: event.target.value }))}
            required
          />
        </label>
        <label>
          <span>Contraseña</span>
          <input
            type="password"
            autoComplete="current-password"
            value={values.password}
            onChange={(event) => setValues((current) => ({ ...current, password: event.target.value }))}
            required
          />
        </label>
        {errorMessage ? <p className="auth-error">{errorMessage}</p> : null}
        <button type="submit">Entrar</button>
      </form>

      <footer className="auth-footer">
        <Link to="/register" state={location.state}>
          Crear cuenta cliente
        </Link>
        <Link to="/">Seguir como invitado</Link>
      </footer>
    </AuthShell>
  )
}

export function RegisterScreen() {
  const auth = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [values, setValues] = useState({ fullName: '', email: '', password: '' })
  const [errorMessage, setErrorMessage] = useState('')
  const redirectPath = getRedirectPath(location.state)

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setErrorMessage('')

    try {
      await auth.registerCustomer(values)
      navigate(redirectPath, { replace: true })
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'No se pudo crear la cuenta.')
    }
  }

  return (
    <AuthShell
      eyebrow="Registro cliente"
      title="Crear cuenta"
      description="El registro público crea solo clientes. Distribuidores e internos se aprueban manualmente."
    >
      <form className="auth-card" onSubmit={handleSubmit}>
        <label>
          <span>Nombre</span>
          <input
            autoComplete="name"
            value={values.fullName}
            onChange={(event) => setValues((current) => ({ ...current, fullName: event.target.value }))}
            required
          />
        </label>
        <label>
          <span>Correo</span>
          <input
            type="email"
            autoComplete="email"
            value={values.email}
            onChange={(event) => setValues((current) => ({ ...current, email: event.target.value }))}
            required
          />
        </label>
        <label>
          <span>Contraseña</span>
          <input
            type="password"
            autoComplete="new-password"
            minLength={6}
            value={values.password}
            onChange={(event) => setValues((current) => ({ ...current, password: event.target.value }))}
            required
          />
        </label>
        {errorMessage ? <p className="auth-error">{errorMessage}</p> : null}
        <button type="submit">Crear cuenta cliente</button>
      </form>

      <footer className="auth-footer">
        <Link to="/login" state={location.state}>
          Ya tengo cuenta
        </Link>
        <Link to="/">Volver al inicio</Link>
      </footer>
    </AuthShell>
  )
}

export function PendingApprovalScreen() {
  const auth = useAuth()

  return (
    <AuthShell
      eyebrow="Cuenta pendiente"
      title="Aprobación requerida"
      description="Este perfil necesita aprobación manual antes de acceder a herramientas privadas."
    >
      <section className="auth-card auth-status-card">
        <strong>{auth.user?.fullName ?? 'Usuario Tonner'}</strong>
        <span>{auth.user?.email}</span>
        <button type="button" onClick={auth.logout}>
          Cerrar sesión
        </button>
      </section>
    </AuthShell>
  )
}

export function AccessDeniedScreen() {
  const auth = useAuth()

  return (
    <AuthShell
      eyebrow="Acceso restringido"
      title="Sin permisos"
      description="Tu rol actual no tiene acceso a esta sección."
    >
      <section className="auth-card auth-status-card">
        <strong>{auth.role}</strong>
        <span>{auth.user?.email ?? 'Invitado'}</span>
        <Link to="/">Volver al inicio</Link>
      </section>
    </AuthShell>
  )
}

export function ProfileScreen() {
  const auth = useAuth()
  const [showTerms, setShowTerms] = useState(false)
  const [profilePanel, setProfilePanel] = useState<ProfilePanel | null>(null)
  const [profileFeedback, setProfileFeedback] = useState('')
  const [editableProfile, setEditableProfile] = useState<EditableProfile>(() =>
    loadEditableProfile(auth.user?.id, auth.user?.fullName),
  )

  const handleProfileSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (auth.user?.id) {
      window.localStorage.setItem(getProfileStorageKey(auth.user.id), JSON.stringify(editableProfile))
      window.localStorage.setItem(
        HUB_PROFILE_STORAGE_KEY,
        JSON.stringify({
          ...editableProfile,
          email: auth.user.email,
        }),
      )
    }

    setProfileFeedback('Datos actualizados en este dispositivo.')
  }

  const handleAvatarChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.addEventListener('load', () => {
      setEditableProfile((current) => ({
        ...current,
        avatar: typeof reader.result === 'string' ? reader.result : '',
      }))
    })
    reader.readAsDataURL(file)
  }

  const profileName = editableProfile.fullName || auth.user?.fullName || 'Usuario Tonner'

  const renderProfilePanel = () => {
    if (profilePanel === 'data') {
      return (
        <section className="auth-profile-panel" aria-label="Mis datos">
          <h1>Mis Datos</h1>
          <form className="auth-profile-editor" onSubmit={handleProfileSubmit}>
            <div className="auth-profile-editor__hero">
              <div className="auth-profile-editor__avatar">
                {editableProfile.avatar ? <img src={editableProfile.avatar} alt="" /> : <span />}
              </div>
              <label className="auth-profile-editor__photo">
                <span>Cambiar foto</span>
                <input type="file" accept="image/*" onChange={handleAvatarChange} />
              </label>
            </div>

            <label>
              <span>Nombre</span>
              <input
                autoComplete="name"
                value={editableProfile.fullName}
                onChange={(event) => setEditableProfile((current) => ({ ...current, fullName: event.target.value }))}
              />
            </label>
            <label>
              <span>Correo</span>
              <input type="email" value={auth.user?.email ?? ''} readOnly />
            </label>
            <label>
              <span>Teléfono</span>
              <input
                inputMode="tel"
                autoComplete="tel"
                value={editableProfile.phone}
                onChange={(event) => setEditableProfile((current) => ({ ...current, phone: event.target.value }))}
              />
            </label>
            <label>
              <span>Ciudad</span>
              <input
                autoComplete="address-level2"
                value={editableProfile.city}
                onChange={(event) => setEditableProfile((current) => ({ ...current, city: event.target.value }))}
              />
            </label>
            <button type="submit">Actualizar datos</button>
            {profileFeedback ? <p className="auth-profile-feedback">{profileFeedback}</p> : null}
          </form>
        </section>
      )
    }

    if (profilePanel === 'distributor') {
      return (
        <section className="auth-profile-panel" aria-label="Vincular distribuidora">
          <h1>Vincular Distribuidora</h1>
          <form className="auth-profile-editor" onSubmit={(event) => event.preventDefault()}>
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

    if (profilePanel === 'preferences') {
      return (
        <section className="auth-profile-panel" aria-label="Preferencias">
          <h1>Preferencias</h1>
          <div className="auth-profile-panel-card">
            {['Notificaciones de productos', 'Alertas de favoritos', 'Actualizaciones Pollamundialista'].map((item) => (
              <label key={item} className="auth-profile-toggle">
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
        <section className="auth-profile-panel" aria-label="Atención al cliente">
          <h1>Atención al Cliente</h1>
          <div className="auth-profile-panel-card auth-profile-support">
            <a href="mailto:marketing@pinturastonner.com">Enviar correo</a>
            <a href="tel:+573000000000">Llamar a Tonner</a>
            <a href="https://wa.me/573000000000">WhatsApp</a>
          </div>
        </section>
      )
    }

    return (
      <section className="auth-profile-panel" aria-label="Términos y condiciones">
        <h1>Términos y Condiciones</h1>
        <div className="auth-profile-panel-card auth-terms-card">
          <LegalTermsContent />
        </div>
      </section>
    )
  }

  if (auth.status === 'guest') {
    return (
      <AuthShell
        eyebrow="Perfil"
        title="Modo invitado"
        description="Puedes ver catálogo, mapa y paint sin cuenta. Inicia sesión para TonnerCup y funciones personalizadas."
      >
        <section className="auth-card auth-status-card">
          <Link to="/login" state={{ from: { pathname: '/profile' } }}>
            Iniciar sesión
          </Link>
          <Link to="/register" state={{ from: { pathname: '/profile' } }}>
            Crear cuenta cliente
          </Link>
          <button type="button" onClick={() => setShowTerms((current) => !current)}>
            Términos y condiciones
          </button>
        </section>
        {showTerms ? (
          <section className="auth-card auth-terms-card">
            <LegalTermsContent />
          </section>
        ) : null}
      </AuthShell>
    )
  }

  return (
    <main className="auth-screen auth-screen--profile">
      <section className="auth-profile-device">
        {profilePanel ? (
          <>
            <header className="auth-profile-top">
              <button type="button" className="auth-profile-top__back" aria-label="Regresar" onClick={() => setProfilePanel(null)}>
                <img src="/icons/boton regreso.png" alt="" />
              </button>
              <img
                src={getOptimizedImageSrc('/logo.webp')}
                alt="Pinturas Tonner"
                className="auth-profile-top__logo"
                decoding="async"
              />
              <button type="button" className="auth-profile-top__bell" aria-label="Notificaciones">
                <img src="/campana icon.png" alt="" />
              </button>
            </header>
            {renderProfilePanel()}
          </>
        ) : (
          <>
            <section className="auth-profile-hero-card">
              <div className="auth-profile-hero-card__avatar">
                {editableProfile.avatar ? <img src={editableProfile.avatar} alt="" /> : null}
              </div>
              <strong>{profileName}</strong>
            </section>

            <h1 className="auth-profile-heading">CONFIGURACIÓN</h1>

            <nav className="auth-profile-menu" aria-label="Configuración de perfil">
              <button type="button" onClick={() => setProfilePanel('data')}>
                Mis Datos
              </button>
              <button type="button" onClick={() => setProfilePanel('preferences')}>
                Preferencias
              </button>
              <button type="button" onClick={() => setProfilePanel('terms')}>
                Términos y Condiciones
              </button>
              <button type="button" onClick={() => setProfilePanel('support')}>
                Atención al Cliente
              </button>
              <button type="button" onClick={auth.logout}>
                Cerrar sesión
              </button>
            </nav>
          </>
        )}
      </section>
    </main>
  )
}

export function InternalToolsScreen() {
  const auth = useAuth()

  return (
    <AuthShell
      eyebrow="Empresa"
      title="Herramientas privadas"
      description="Área reservada para distribuidores, internos y administradores."
    >
      <section className="auth-card auth-status-card">
        <strong>{auth.user?.fullName}</strong>
        <span>Rol autorizado: {auth.role}</span>
        <span>Permisos: {auth.permissions.join(', ')}</span>
        <Link to="/profile">Volver al perfil</Link>
      </section>
    </AuthShell>
  )
}
