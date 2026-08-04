import { useState, type FormEvent } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'

import { useAuth } from '../../auth/useAuth'
import { AuthShell } from './authScreenUtils'
import { getRedirectPath } from './redirectPath'
import { PasswordField } from './PasswordField'

export default function RegisterScreen() {
  const auth = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [values, setValues] = useState({
    fullName: '',
    email: '',
    password: '',
  })
  const [errorMessage, setErrorMessage] = useState('')
  const redirectPath = getRedirectPath(location.state)

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1)
      return
    }

    navigate('/login')
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setErrorMessage('')

    try {
      await auth.registerCustomer({
        ...values,
        participantType: 'public',
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
      description="Crea tu cuenta cliente para guardar favoritos y usar funciones personalizadas."
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
        <PasswordField
          label="Contraseña"
          autoComplete="new-password"
          minLength={6}
          value={values.password}
          onChange={(password) => setValues((current) => ({ ...current, password }))}
          required
        />
        {errorMessage ? <p className="auth-error">{errorMessage}</p> : null}
        <button type="submit">Crear cuenta cliente</button>
      </form>

      <footer className="auth-footer">
        <Link to="/login" state={location.state}>
          Ya tengo cuenta
        </Link>
        <button type="button" onClick={handleBack}>
          Volver atrás
        </button>
      </footer>
    </AuthShell>
  )
}
