import type { ChangeEvent, FormEvent } from 'react'

import LegalTermsContent from '../../components/LegalTermsContent'
import { profileOptions } from './hubData'
import type { HubProfileDraft, ProfilePanel } from './types'

type HubProfileProps = {
  hubProfile: HubProfileDraft
  profileFeedback: string
  profilePanel: ProfilePanel | null
  onAvatarChange: (event: ChangeEvent<HTMLInputElement>) => void
  onProfileChange: (updater: (current: HubProfileDraft) => HubProfileDraft) => void
  onProfileSubmit: (message: string) => (event: FormEvent<HTMLFormElement>) => void
  onSelectPanel: (panel: ProfilePanel) => void
}

function HubProfilePanel({
  hubProfile,
  profilePanel,
  onAvatarChange,
  onProfileChange,
  onProfileSubmit,
}: Omit<HubProfileProps, 'profileFeedback' | 'onSelectPanel'>) {
  if (!profilePanel) return null

  if (profilePanel === 'distributor') {
    return (
      <section className="hub-profile-detail" aria-label="Vincular distribuidora">
        <h1>Vincular Distribuidora</h1>
        <form onSubmit={onProfileSubmit('Distribuidora vinculada.')}>
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
        <form onSubmit={onProfileSubmit('Datos actualizados.')}>
          <div className="hub-profile-photo-row">
            <div className="hub-profile-avatar hub-profile-avatar--small">
              {hubProfile.avatar ? <img src={hubProfile.avatar} alt="" /> : null}
            </div>
            <label className="hub-profile-photo-button">
              <span>Cambiar foto</span>
              <input type="file" accept="image/*" onChange={onAvatarChange} />
            </label>
          </div>
          <label>
            <span>Nombre</span>
            <input
              value={hubProfile.fullName}
              onChange={(event) => onProfileChange((current) => ({ ...current, fullName: event.target.value }))}
            />
          </label>
          <label>
            <span>Correo</span>
            <input
              value={hubProfile.email}
              type="email"
              onChange={(event) => onProfileChange((current) => ({ ...current, email: event.target.value }))}
            />
          </label>
          <label>
            <span>Teléfono</span>
            <input
              value={hubProfile.phone}
              inputMode="tel"
              onChange={(event) => onProfileChange((current) => ({ ...current, phone: event.target.value }))}
            />
          </label>
          <label>
            <span>Ciudad</span>
            <input
              value={hubProfile.city}
              onChange={(event) => onProfileChange((current) => ({ ...current, city: event.target.value }))}
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
          <a href="mailto:tonnerapp@pinturastonner.com">Enviar correo</a>
          <a href="https://wa.me/573224164646">WhatsApp</a>
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

export default function HubProfile({
  hubProfile,
  profileFeedback,
  profilePanel,
  onAvatarChange,
  onProfileChange,
  onProfileSubmit,
  onSelectPanel,
}: HubProfileProps) {
  if (profilePanel) {
    return (
      <main className="hub-profile-screen hub-profile-screen--detail" aria-label="Perfil">
        <HubProfilePanel
          hubProfile={hubProfile}
          profilePanel={profilePanel}
          onAvatarChange={onAvatarChange}
          onProfileChange={onProfileChange}
          onProfileSubmit={onProfileSubmit}
        />
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

      <button className="hub-profile-link" type="button" onClick={() => onSelectPanel('distributor')}>
        Vincular Distribuidora
      </button>

      <h1>CONFIGURACIÓN</h1>

      {profileOptions.map((item, index) => (
        <button
          key={`${item.label}-${index}`}
          className="hub-profile-option"
          type="button"
          onClick={() => onSelectPanel(item.panel)}
        >
          {item.label}
        </button>
      ))}
    </main>
  )
}
