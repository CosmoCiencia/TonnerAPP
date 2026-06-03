import { useState, type ChangeEvent, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import LegalTermsContent from '../../components/LegalTermsContent'
import { useAuth } from '../../auth/useAuth'
import { updateProfileFullName } from '../../auth/auth.service'
import { getOptimizedImageSrc } from '../../services/imageAssets'
import { AuthShell } from './authScreenUtils'

type EditableProfile = {
  fullName: string
  phone: string
  city: string
  avatar: string
}

type ProfilePanel = 'data' | 'distributor' | 'preferences' | 'terms' | 'support'

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
  const navigate = useNavigate()
  const [profilePanel, setProfilePanel] = useState<ProfilePanel | null>(null)
  const [profileFeedback, setProfileFeedback] = useState('')
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
  const profileTypeLabel = cupUserTypeLabels[auth.user?.cupUserType ?? 'public']

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
        showTopBar
        showHeaderLogo={false}
      >
        <section className="auth-card auth-status-card auth-status-card--guest-login">
          <Link to="/login" state={{ from: { pathname: '/profile' } }}>
            Iniciar sesión
          </Link>
          <Link to="/register-type" state={{ from: { pathname: '/profile' } }}>
            Crear cuenta cliente
          </Link>
        </section>
      </AuthShell>
    )
  }

  return (
    <main className="auth-screen auth-screen--profile">
      <section className="auth-profile-device">
        <header className="auth-profile-top">
          <button
            type="button"
            className="auth-profile-top__back"
            aria-label="Regresar"
            onClick={() => {
              if (profilePanel) {
                setProfilePanel(null)
                return
              }

              navigate('/')
            }}
          >
            <img src="/icons/boton regreso.png" alt="" />
          </button>
          <img
            src={getOptimizedImageSrc('/brand/logo.webp')}
            alt="Pinturas Tonner"
            className="auth-profile-top__logo"
            decoding="async"
          />
          <button type="button" className="auth-profile-top__bell" aria-label="Notificaciones">
            <img src="/shared/campana-icon.png" alt="" />
          </button>
        </header>

        <div className="auth-profile-body">
          {profilePanel ? (
            renderProfilePanel()
          ) : (
            <>
              <section className="auth-profile-hero-card">
                <div className="auth-profile-hero-card__avatar">
                  {editableProfile.avatar ? <img src={editableProfile.avatar} alt="" /> : null}
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
