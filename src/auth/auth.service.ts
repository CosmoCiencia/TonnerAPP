import type { AuthChangeEvent, Session } from '@supabase/supabase-js'

import { supabase } from '../lib/supabase'
import type { AuthUser, LoginInput, RegisterInput } from './auth.types'

type AuthStateChangeCallback = (event: AuthChangeEvent, user: AuthUser | null) => void

function toCustomerUser(session: Session | null): AuthUser | null {
  const user = session?.user

  if (!user?.email) {
    return null
  }

  return {
    id: user.id,
    email: user.email,
    fullName: user.user_metadata?.full_name || user.email,
    role: 'customer',
    status: 'active',
    permissions: ['cup.play'],
  }
}

async function createCustomerProfile(user: AuthUser) {
  const { error } = await supabase.from('profiles').upsert(
    {
      id: user.id,
      email: user.email,
      role: 'customer',
    },
    { onConflict: 'id' },
  )

  if (error) {
    throw new Error(
      `El usuario fue creado, pero no se pudo crear el perfil. Revisa que la tabla profiles tenga permisos para authenticated. Detalle: ${error.message}`,
    )
  }
}

export async function getSession() {
  const { data, error } = await supabase.auth.getSession()

  if (error) {
    throw new Error(error.message)
  }

  return toCustomerUser(data.session)
}

export function onAuthStateChange(callback: AuthStateChangeCallback) {
  const { data } = supabase.auth.onAuthStateChange((event, session) => {
    callback(event, toCustomerUser(session))
  })

  return () => data.subscription.unsubscribe()
}

export async function signIn({ email, password }: LoginInput) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: email.trim().toLowerCase(),
    password,
  })

  if (error) {
    throw new Error(error.message)
  }

  const user = toCustomerUser(data.session)

  if (!user) {
    throw new Error('No se pudo restaurar la sesión.')
  }

  return user
}

export async function signUp({ email, fullName, password }: RegisterInput) {
  const { data, error } = await supabase.auth.signUp({
    email: email.trim().toLowerCase(),
    password,
    options: {
      data: {
        full_name: fullName.trim(),
      },
    },
  })

  if (error) {
    throw new Error(error.message)
  }

  const user = toCustomerUser(data.session) ?? (
    data.user?.email
      ? {
          id: data.user.id,
          email: data.user.email,
          fullName: data.user.user_metadata?.full_name || fullName.trim() || data.user.email,
          role: 'customer' as const,
          status: 'active' as const,
          permissions: ['cup.play' as const],
        }
      : null
  )

  if (!user) {
    throw new Error('No se pudo crear el usuario.')
  }

  await createCustomerProfile(user)
  return user
}

export async function signOut() {
  const { error } = await supabase.auth.signOut()

  if (error) {
    throw new Error(error.message)
  }
}
