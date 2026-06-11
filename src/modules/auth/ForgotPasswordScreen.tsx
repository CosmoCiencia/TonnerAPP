import { useState, type FormEvent } from 'react'
import { Link, useLocation } from 'react-router-dom'

import { sendPasswordRecoveryEmail } from '../../auth/auth.service'
import { AuthShell } from './authScreenUtils'

export default function ForgotPasswordScreen() {
  const location = useLocation()
  const [email, setEmail] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setErrorMessage('')
    setSuccessMessage('')
    setIsSubmitting(true)

    try {
      await sendPasswordRecoveryEmail(email)
      setSuccessMessage('Si el correo está registrado, recibirás un enlace para cambiar tu contraseña.')
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'No se pudo enviar el enlace de recuperación.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AuthShell
      eyebrow="Cuenta Tonner"
      title="Recuperar contraseña"
      description="Escribe tu correo y te enviaremos un enlace seguro para crear una contraseña nueva."
      showHeaderLogo={false}
    >
      <form className="auth-card" onSubmit={handleSubmit}>
        <label>
          <span>Correo</span>
          <input
            type="email"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
        </label>
        {errorMessage ? <p className="auth-error">{errorMessage}</p> : null}
        {successMessage ? <p className="auth-success">{successMessage}</p> : null}
        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Enviando...' : 'Enviar enlace'}
        </button>
      </form>

      <footer className="auth-footer">
        <Link to="/login" state={location.state}>
          Volver al inicio de sesión
        </Link>
      </footer>
    </AuthShell>
  )
}
