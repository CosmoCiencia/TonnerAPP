import { useState, type FormEvent } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'

import { useAuth } from '../../auth/useAuth'
import type { LoginInput } from '../../auth/auth.types'
import { AuthShell } from './authScreenUtils'
import { getRedirectPath } from './redirectPath'

export default function LoginScreen() {
  const auth = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [values, setValues] = useState<LoginInput>({ email: '', password: '' })
  const [errorMessage, setErrorMessage] = useState('')
  const redirectPath = getRedirectPath(location.state)

  const loginWith = async (input: LoginInput) => {
    setErrorMessage('')

    try {
      await auth.login(input)
      navigate(redirectPath, { replace: true })
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'No se pudo iniciar sesión.')
    }
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    await loginWith(values)
  }

  return (
    <AuthShell
      eyebrow="Acceso Tonner"
      title="Iniciar sesión"
      description="Entra para usar TonnerCup, ranking y funciones personalizadas."
      showTopBar
      showHeaderLogo={false}
    >
      <form className="auth-card" onSubmit={handleSubmit}>
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
            autoComplete="current-password"
            value={values.password}
            onChange={(event) => setValues((current) => ({ ...current, password: event.target.value }))}
            required
          />
        </label>
        {errorMessage ? <p className="auth-error">{errorMessage}</p> : null}
        <button type="submit">Entrar</button>
      </form>

      <footer className="auth-footer">
        <Link to="/forgot-password" state={location.state}>
          Olvidé mi contraseña
        </Link>
        <Link to="/register" state={location.state}>
          Crear cuenta cliente
        </Link>
        <Link to="/">Seguir como invitado</Link>
      </footer>
    </AuthShell>
  )
}
