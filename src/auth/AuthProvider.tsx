import { useEffect, useMemo, useState, type ReactNode } from 'react'

import { getSession, onAuthStateChange, signIn, signOut, signUp } from './auth.service'
import { AuthContext, type AuthContextValue } from './auth.context'
import type { AuthState, AuthUser } from './auth.types'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [status, setStatus] = useState<AuthState['status']>('loading')

  useEffect(() => {
    let isMounted = true

    getSession()
      .then((sessionUser) => {
        if (!isMounted) return
        setUser(sessionUser)
        setStatus(sessionUser ? 'authenticated' : 'guest')
      })
      .catch((error) => {
        if (!isMounted) return
        console.error(error)
        setUser(null)
        setStatus('guest')
      })

    const unsubscribe = onAuthStateChange((_event, sessionUser) => {
      setUser(sessionUser)
      setStatus(sessionUser ? 'authenticated' : 'guest')
    })

    return () => {
      isMounted = false
      unsubscribe()
    }
  }, [])

  useEffect(() => {
    const tonnerWindow = window as Window & {
      __TONNER_CONTEXT__?: {
        user_id?: string
        cup_user_type?: string
      }
    }

    tonnerWindow.__TONNER_CONTEXT__ = {
      ...tonnerWindow.__TONNER_CONTEXT__,
      user_id: user?.id,
      cup_user_type: user?.cupUserType,
    }
  }, [user])

  const value = useMemo<AuthContextValue>(() => {
    const authState: AuthState = {
      status,
      user,
      role: user?.role ?? 'guest',
      permissions: user?.permissions ?? [],
    }

    return {
      ...authState,
      async login(input) {
        const nextUser = await signIn(input)
        setUser(nextUser)
        setStatus('authenticated')
        return nextUser
      },
      async registerCustomer(input) {
        const nextUser = await signUp(input)
        setUser(nextUser)
        setStatus('authenticated')
        return nextUser
      },
      async logout() {
        await signOut()
        setUser(null)
        setStatus('guest')
      },
    }
  }, [status, user])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
