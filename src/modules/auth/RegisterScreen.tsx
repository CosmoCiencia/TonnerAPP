import { useState, type FormEvent } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'

import { useAuth } from '../../auth/useAuth'
import type { CupUserType } from '../../auth/auth.types'
import { AuthShell } from './authScreenUtils'
import { getRedirectPath } from './redirectPath'

const participantLabels: Record<CupUserType, string> = {
  public: 'Cliente normal',
  distributor: 'Distribuidor',
  internal: 'Interno',
}

const getSelectedParticipantType = (state: unknown): CupUserType => {
  if (!state || typeof state !== 'object' || !('participantType' in state)) return 'public'

  const participantType = state.participantType

  if (participantType === 'internal' || participantType === 'distributor' || participantType === 'public') {
    return participantType
  }

  return 'public'
}

export default function RegisterScreen() {
  const auth = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const selectedParticipantType = getSelectedParticipantType(location.state)
  const [values, setValues] = useState({
    participantType: selectedParticipantType,
    accessCode: '',
    fullName: '',
    email: '',
    password: '',
  })
  const [errorMessage, setErrorMessage] = useState('')
  const redirectPath = getRedirectPath(location.state)

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setErrorMessage('')

    if (values.participantType !== 'public' && !values.accessCode.trim()) {
      setErrorMessage('Ingresa el código de acceso para este tipo de participante.')
      return
    }

    try {
      await auth.registerCustomer({
        ...values,
        accessCode: values.participantType === 'public' ? undefined : values.accessCode,
      })
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
        <div className="auth-selected-type">
          <span>Tipo de cuenta</span>
          <strong>{participantLabels[values.participantType]}</strong>
          <Link to="/register-type" state={location.state}>
            Cambiar
          </Link>
        </div>

        {values.participantType !== 'public' ? (
          <label>
            <span>Código de acceso</span>
            <input
              type="password"
              autoComplete="off"
              value={values.accessCode}
              onChange={(event) => setValues((current) => ({ ...current, accessCode: event.target.value }))}
              required
            />
          </label>
        ) : null}

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
        <Link to="/register-type" state={location.state}>
          Volver atrás
        </Link>
      </footer>
    </AuthShell>
  )
}
