import { useLocation, useNavigate } from 'react-router-dom'

import type { CupUserType } from '../../auth/auth.types'
import { AuthShell } from './authScreenUtils'

const participantOptions: Array<{ value: CupUserType; label: string; description: string }> = [
  { value: 'public', label: 'Cliente normal', description: 'Cuenta pública para participar en TonnerCup.' },
  { value: 'distributor', label: 'Distribuidor', description: 'Requiere código de acceso de distribuidor.' },
  { value: 'internal', label: 'Interno', description: 'Requiere código de acceso interno.' },
]

const getRouteState = (state: unknown) => (state && typeof state === 'object' ? state : {})

export default function ParticipantTypeScreen() {
  const navigate = useNavigate()
  const location = useLocation()
  const baseState = getRouteState(location.state)

  const handleSelect = (participantType: CupUserType) => {
    navigate('/register', {
      state: {
        ...baseState,
        participantType,
      },
    })
  }

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1)
      return
    }

    navigate('/profile')
  }

  return (
    <AuthShell
      eyebrow="Registro TonnerCup"
      title="¿Qué eres?"
      description="Elige el tipo de participante para crear tu cuenta."
      showTopBar
      showHeaderLogo={false}
    >
      <section className="auth-card auth-choice-card">
        {participantOptions.map((option) => (
          <button key={option.value} type="button" onClick={() => handleSelect(option.value)}>
            <strong>{option.label}</strong>
            <span>{option.description}</span>
          </button>
        ))}
      </section>

      <footer className="auth-footer">
        <button type="button" onClick={handleBack}>
          Volver atrás
        </button>
      </footer>
    </AuthShell>
  )
}
