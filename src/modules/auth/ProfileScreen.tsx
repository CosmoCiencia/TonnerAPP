import { useState, type FormEvent } from 'react'
import { UserRound } from 'lucide-react'
import { Link } from 'react-router-dom'

import LegalTermsContent from '../../components/LegalTermsContent'
import { useAuth } from '../../auth/useAuth'
import { updateProfileFullName } from '../../auth/auth.service'
import { AuthShell } from './authScreenUtils'

type EditableProfile = {
  fullName: string
  phone: string
  city: string
  avatar: string
}

type ProfilePanel = 'data' | 'distributor' | 'preferences' | 'terms' | 'support' | 'delete'

const getProfileStorageKey = (userId: string) => `tonnerapp-profile-${userId}`
const HUB_PROFILE_STORAGE_KEY = 'tonnerapp-hub-profile'

const cupUserTypeLabels = {
  public: 'Cliente normal',
  internal: 'Interno',
  distributor: 'Distribuidor',
} as const

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

export default function ProfileScreen() {
  const auth = useAuth()
  const [profilePanel, setProfilePanel] = useState<ProfilePanel | null>(null)
  const [profileFeedback, setProfileFeedback] = useState('')
  const [deleteStep, setDeleteStep] = useState<'warning' | 'confirm'>('warning')
  const [deleteError, setDeleteError] = useState('')
  const [isDeleting, setIsDeleting] = useState(false)
  const [editableProfile, setEditableProfile] = useState<EditableProfile>(() =>
    loadEditableProfile(auth.user?.id, auth.user?.fullName),
  )

  const handleProfileSubmit = async (event: FormEvent<HTMLFormElement>) => {
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

      try {
        await updateProfileFullName(auth.user.id, editableProfile.fullName)
        setProfileFeedback('Datos actualizados.')
        return
      } catch (error) {
        setProfileFeedback(error instanceof Error ? error.message : 'No se pudo actualizar el perfil.')
        return
      }
    }

    setProfileFeedback('Datos actualizados en este dispositivo.')
  }

  const profileName = editableProfile.fullName || auth.user?.fullName || 'Usuario Tonner'
  const profileTypeLabel = cupUserTypeLabels[auth.user?.cupUserType ?? 'public']

  const handleDeleteAccount = async () => {
    if (isDeleting) return

    setIsDeleting(true)
    setDeleteError('')

    try {
      await auth.deleteAccount()
    } catch (error) {
      setDeleteError(error instanceof Error ? error.message : 'No se pudo eliminar la cuenta.')
      setIsDeleting(false)
    }
  }

  const renderProfilePanel = () => {
    if (profilePanel === 'data') {
      return (
        <section className="auth-profile-panel" aria-label="Mis datos">
          <h1>Mis Datos</h1>
          <form className="auth-profile-editor" onSubmit={handleProfileSubmit}>
            <div className="auth-profile-editor__hero">
              <div className="auth-profile-editor__avatar">
                <UserRound aria-hidden="true" />
              </div>
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
              <span>Tipo de cuenta</span>
              <input value={profileTypeLabel} readOnly />
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
            {['Notificaciones de productos', 'Alertas de favoritos', 'Actualizaciones Polla Tonner'].map((item) => (
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
            <a href="mailto:tonnerapp@pinturastonner.com">Enviar correo</a>
            <a href="https://wa.me/573224164646">WhatsApp</a>
          </div>
        </section>
      )
    }

    if (profilePanel === 'delete') {
      return (
        <section className="auth-profile-panel" aria-label="Eliminar cuenta">
          <h1>Eliminar cuenta</h1>
          <div className="auth-profile-panel-card auth-delete-account">
            {deleteStep === 'warning' ? (
              <>
                <strong>Esta acción es permanente</strong>
                <p>
                  Se eliminarán tu cuenta, perfil, predicciones y puntajes. No podrás recuperar esta información.
                </p>
                <button type="button" className="auth-delete-account__continue" onClick={() => setDeleteStep('confirm')}>
                  Continuar
                </button>
                <button type="button" className="auth-delete-account__cancel" onClick={() => setProfilePanel(null)}>
                  Cancelar
                </button>
              </>
            ) : (
              <>
                <strong>¿Eliminar tu cuenta definitivamente?</strong>
                <p>Esta es la confirmación final. La eliminación comenzará inmediatamente.</p>
                <button
                  type="button"
                  className="auth-delete-account__confirm"
                  disabled={isDeleting}
                  onClick={handleDeleteAccount}
                >
                  {isDeleting ? 'Eliminando cuenta…' : 'Eliminar cuenta definitivamente'}
                </button>
                <button
                  type="button"
                  className="auth-delete-account__cancel"
                  disabled={isDeleting}
                  onClick={() => setDeleteStep('warning')}
                >
                  Volver
                </button>
              </>
            )}
            {deleteError ? <p className="auth-delete-account__error" role="alert">{deleteError}</p> : null}
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
        showHeaderLogo={false}
      >
        <section className="auth-card auth-status-card auth-status-card--guest-login">
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
    <main className="auth-screen auth-screen--profile">
      <section className="auth-profile-device">
        <div className="auth-profile-body">
          {profilePanel ? (
            renderProfilePanel()
          ) : (
            <>
              <section className="auth-profile-hero-card">
                <div className="auth-profile-hero-card__avatar">
                  <UserRound aria-hidden="true" />
                </div>
                <div className="auth-profile-hero-card__identity">
                  <strong>{profileName}</strong>
                  <span className="auth-profile-hero-card__type">{profileTypeLabel}</span>
                </div>
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
                <button
                  type="button"
                  className="auth-profile-menu__delete"
                  onClick={() => {
                    setDeleteStep('warning')
                    setDeleteError('')
                    setProfilePanel('delete')
                  }}
                >
                  Eliminar cuenta
                </button>
                <button type="button" onClick={auth.logout}>
                  Cerrar sesión
                </button>
              </nav>
            </>
          )}
        </div>
      </section>
    </main>
  )
}
