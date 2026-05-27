import { Link } from 'react-router-dom'

import { useAuth } from '../../auth/useAuth'
import { AuthShell } from './authScreenUtils'

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
