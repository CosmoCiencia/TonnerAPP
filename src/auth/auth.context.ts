import { createContext } from 'react'

import type { AuthState, AuthUser, LoginInput, RegisterInput } from './auth.types'

export type AuthContextValue = AuthState & {
  login: (input: LoginInput) => Promise<AuthUser>
  registerCustomer: (input: RegisterInput) => Promise<AuthUser>
  logout: () => Promise<void>
}

export const AuthContext = createContext<AuthContextValue | null>(null)
