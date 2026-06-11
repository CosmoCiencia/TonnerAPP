import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import { useAuth } from '../../auth/useAuth'
import { AuthShell } from './authScreenUtils'
import { PasswordField } from './PasswordField'

export default function ResetPasswordScreen() {
  const auth = useAuth()
  const navigate = useNavigate()
  const [password, setPassword] = useState('')
  const [passwordConfirmation, setPasswordConfirmation] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setErrorMessage('')

    if (password.length < 6) {
      setErrorMessage('La contraseña debe tener mínimo 6 caracteres.')
      return
    }

    if (password !== passwordConfirmation) {
      setErrorMessage('Las contraseñas no coinciden.')
      return
    }

    setIsSubmitting(true)

    try {
      await auth.completePasswordRecovery(password)
      navigate('/profile', { replace: true })
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : 'No se pudo actualizar la contraseña. Abre de nuevo el enlace de recuperación.',
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  if (auth.status === 'loading') {
    return (
      <AuthShell
        eyebrow="Cuenta Tonner"
        title="Validando enlace"
        description="Estamos revisando el enlace de recuperación antes de permitir el cambio."
        showHeaderLogo={false}
      >
        <p className="auth-card auth-muted-message">Un momento...</p>
      </AuthShell>
    )
  }

  if (!auth.isPasswordRecovery) {
    return (
      <AuthShell
        eyebrow="Cuenta Tonner"
        title="Enlace requerido"
        description="Para cambiar la contraseña necesitas abrir el enlace de recuperación enviado a tu correo."
        showHeaderLogo={false}
      >
        <footer className="auth-footer">
          <Link to="/forgot-password">Solicitar enlace</Link>
          <Link to="/login">Volver al inicio de sesión</Link>
        </footer>
      </AuthShell>
    )
  }

  return (
    <AuthShell
      eyebrow="Cuenta Tonner"
      title="Nueva contraseña"
      description="Crea una contraseña nueva para volver a entrar a tu cuenta."
      showHeaderLogo={false}
    >
      <form className="auth-card" onSubmit={handleSubmit}>
        <PasswordField
          label="Contraseña nueva"
          autoComplete="new-password"
          minLength={6}
          value={password}
          onChange={setPassword}
          required
        />
        <PasswordField
          label="Confirmar contraseña"
          autoComplete="new-password"
          minLength={6}
          value={passwordConfirmation}
          onChange={setPasswordConfirmation}
          required
        />
        {errorMessage ? <p className="auth-error">{errorMessage}</p> : null}
        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Guardando...' : 'Guardar contraseña'}
        </button>
      </form>

      <footer className="auth-footer">
        <Link to="/login">Volver al inicio de sesión</Link>
      </footer>
    </AuthShell>
  )
}
