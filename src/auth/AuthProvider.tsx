import { useEffect, useMemo, useState, type ReactNode } from 'react'

import {
  PASSWORD_RECOVERY_LINK_EVENT,
  deleteOwnAccount,
  getSession,
  onAuthStateChange,
  signIn,
  signOut,
  signUp,
  updatePassword,
} from './auth.service'
import { AuthContext, type AuthContextValue } from './auth.context'
import type { AuthState, AuthUser } from './auth.types'

const PASSWORD_RECOVERY_STORAGE_KEY = 'tonnerapp-password-recovery'
const HUB_PROFILE_STORAGE_KEY = 'tonnerapp-hub-profile'
const FAVORITES_STORAGE_KEY = 'tonnerapp-favorites-v1'
const LEGACY_FAVORITES_STORAGE_KEY = 'tonnerapp-favorite-products'

function clearLocalUserData(userId: string) {
  window.localStorage.removeItem(`tonnerapp-profile-${userId}`)
  window.localStorage.removeItem(HUB_PROFILE_STORAGE_KEY)
  window.localStorage.removeItem(FAVORITES_STORAGE_KEY)
  window.localStorage.removeItem(LEGACY_FAVORITES_STORAGE_KEY)
}

function loadPasswordRecoveryState() {
  return window.sessionStorage.getItem(PASSWORD_RECOVERY_STORAGE_KEY) === 'true'
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [status, setStatus] = useState<AuthState['status']>('loading')
  const [isPasswordRecovery, setIsPasswordRecovery] = useState(loadPasswordRecoveryState)

  const setPasswordRecovery = (isActive: boolean) => {
    setIsPasswordRecovery(isActive)

    if (isActive) {
      window.sessionStorage.setItem(PASSWORD_RECOVERY_STORAGE_KEY, 'true')
    } else {
      window.sessionStorage.removeItem(PASSWORD_RECOVERY_STORAGE_KEY)
    }
  }

  useEffect(() => {
    let isMounted = true

    const handlePasswordRecoveryLink = () => {
      if (isMounted) {
        setPasswordRecovery(true)
      }
    }

    window.addEventListener(PASSWORD_RECOVERY_LINK_EVENT, handlePasswordRecoveryLink)

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

    const unsubscribe = onAuthStateChange((event, sessionUser) => {
      if (event === 'PASSWORD_RECOVERY') {
        setPasswordRecovery(true)
      }

      setUser(sessionUser)
      setStatus(sessionUser ? 'authenticated' : 'guest')
    })

    return () => {
      isMounted = false
      window.removeEventListener(PASSWORD_RECOVERY_LINK_EVENT, handlePasswordRecoveryLink)
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
      isPasswordRecovery,
    }

    return {
      ...authState,
      async login(input) {
        const nextUser = await signIn(input)
        setPasswordRecovery(false)
        setUser(nextUser)
        setStatus('authenticated')
        return nextUser
      },
      async registerCustomer(input) {
        const nextUser = await signUp(input)
        setPasswordRecovery(false)
        setUser(nextUser)
        setStatus('authenticated')
        return nextUser
      },
      async completePasswordRecovery(password) {
        if (!isPasswordRecovery) {
          throw new Error('Abre el enlace de recuperación enviado a tu correo para cambiar la contraseña.')
        }

        await updatePassword(password)
        setPasswordRecovery(false)
      },
      async deleteAccount() {
        if (!user?.id) {
          throw new Error('Debes iniciar sesión para eliminar tu cuenta.')
        }

        const deletedUserId = user.id
        await deleteOwnAccount()
        clearLocalUserData(deletedUserId)
        setPasswordRecovery(false)
        setUser(null)
        setStatus('guest')
      },
      async logout() {
        await signOut()
        setPasswordRecovery(false)
        setUser(null)
        setStatus('guest')
      },
    }
  }, [isPasswordRecovery, status, user])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
