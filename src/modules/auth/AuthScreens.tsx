import { useState, type FormEvent, type ReactNode } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'

import { useAuth } from '../../auth/useAuth'
import type { LoginInput } from '../../auth/auth.types'
import { canAccessPrivateTools } from '../../auth/roleAccess'
import { getOptimizedImageSrc } from '../../services/imageAssets'

type LocationState = {
  from?: {
    pathname?: string
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
          <img src={getOptimizedImageSrc('/logo.png')} alt="Pinturas Tonner" decoding="async" />
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
        </section>
      </AuthShell>
    )
  }

  return (
    <AuthShell
      eyebrow="Perfil"
      title={auth.user?.fullName ?? 'Usuario Tonner'}
      description="Sesión real de Supabase Auth con rol customer inicial."
    >
      <section className="auth-card auth-status-card">
        <strong>{auth.user?.email}</strong>
        <span>Rol: {auth.role}</span>
        <span>Estado: {auth.user?.status}</span>
        {canAccessPrivateTools(auth) ? <Link to="/internal">Herramientas privadas</Link> : null}
        <button type="button" onClick={auth.logout}>
          Cerrar sesión
        </button>
      </section>
    </AuthShell>
  )
}

export function InternalToolsScreen() {
  const auth = useAuth()

  return (
    <AuthShell
      eyebrow="Empresa"
      title="Herramientas privadas"
      description="Área mock reservada para distribuidores, internos y administradores."
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
