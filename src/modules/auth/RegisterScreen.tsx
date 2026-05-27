import { useState, type FormEvent } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'

import { useAuth } from '../../auth/useAuth'
import { AuthShell } from './authScreenUtils'
import { getRedirectPath } from './redirectPath'

export default function RegisterScreen() {
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
