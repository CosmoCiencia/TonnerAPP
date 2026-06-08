import type { AuthChangeEvent, Session } from '@supabase/supabase-js'

import { isSupabaseConfigured, requireSupabase } from '../lib/supabase'
import type { AuthUser, CupUserType, LoginInput, RegisterInput } from './auth.types'

type AuthStateChangeCallback = (event: AuthChangeEvent, user: AuthUser | null) => void

type ProfileRow = {
  full_name: string | null
  role: AuthUser['role'] | null
  cup_user_type: CupUserType | null
}

function normalizeCupUserType(value: string | null | undefined): CupUserType {
  if (value === 'internal' || value === 'distributor') return value
  return 'public'
}

async function toCustomerUser(session: Session | null): Promise<AuthUser | null> {
  const user = session?.user

  if (!user?.email) {
    return null
  }

  const supabase = requireSupabase()
  const { data } = await supabase
    .from('profiles')
    .select('full_name,role,cup_user_type')
    .eq('id', user.id)
    .maybeSingle()
  const profile = data as ProfileRow | null

  return {
    id: user.id,
    email: user.email,
    fullName: profile?.full_name || user.user_metadata?.full_name || user.email,
    cupUserType: normalizeCupUserType(profile?.cup_user_type),
    role: profile?.role ?? 'customer',
    status: 'active',
    permissions: ['cup.play'],
  }
}

async function createCustomerProfile(user: AuthUser, accessCode?: string) {
  const supabase = requireSupabase()
  const { data, error } = await supabase
    .rpc('upsert_own_customer_profile', {
      profile_full_name: user.fullName,
      access_code: accessCode?.trim() || null,
    })
    .single()

  if (error) {
    throw new Error(
      `El usuario fue creado, pero no se pudo crear el perfil. Detalle: ${error.message}`,
    )
  }

  const profile = data as ProfileRow & { full_name: string | null }

  return {
    ...user,
    fullName: profile.full_name || user.fullName,
    cupUserType: normalizeCupUserType(profile.cup_user_type),
    role: profile.role ?? 'customer',
  }
}

export async function getSession() {
  if (!isSupabaseConfigured) {
    return null
  }

  const supabase = requireSupabase()
  const { data, error } = await supabase.auth.getSession()

  if (error) {
    throw new Error(error.message)
  }

  return toCustomerUser(data.session)
}

export function onAuthStateChange(callback: AuthStateChangeCallback) {
  if (!isSupabaseConfigured) {
    return () => {}
  }

  const supabase = requireSupabase()
  const { data } = supabase.auth.onAuthStateChange((event, session) => {
    void toCustomerUser(session)
      .then((user) => callback(event, user))
      .catch((error) => {
        console.error(error)
        callback(event, null)
      })
  })

  return () => data.subscription.unsubscribe()
}

export async function signIn({ email, password }: LoginInput) {
  const supabase = requireSupabase()
  const { data, error } = await supabase.auth.signInWithPassword({
    email: email.trim().toLowerCase(),
    password,
  })

  if (error) {
    throw new Error(error.message)
  }

  const user = await toCustomerUser(data.session)

  if (!user) {
    throw new Error('No se pudo restaurar la sesión.')
  }

  return user
}

export async function signUp({ email, fullName, password, accessCode }: RegisterInput) {
  const supabase = requireSupabase()
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

  const user = (await toCustomerUser(data.session)) ?? (
    data.user?.email
      ? {
          id: data.user.id,
          email: data.user.email,
          fullName: data.user.user_metadata?.full_name || fullName.trim() || data.user.email,
          cupUserType: 'public' as const,
          role: 'customer' as const,
          status: 'active' as const,
          permissions: ['cup.play' as const],
        }
      : null
  )

  if (!user) {
    throw new Error('No se pudo crear el usuario.')
  }

  return createCustomerProfile(user, accessCode)
}

export async function signOut() {
  const supabase = requireSupabase()
  const { error } = await supabase.auth.signOut()

  if (error) {
    throw new Error(error.message)
  }
}

export async function sendPasswordRecoveryEmail(email: string) {
  const supabase = requireSupabase()
  const redirectTo = `${window.location.origin}/reset-password`
  const { error } = await supabase.auth.resetPasswordForEmail(email.trim().toLowerCase(), {
    redirectTo,
  })

  if (error) {
    throw new Error(error.message)
  }
}

export async function updatePassword(password: string) {
  const supabase = requireSupabase()
  const { error } = await supabase.auth.updateUser({ password })

  if (error) {
    throw new Error(error.message)
  }
}

export async function updateProfileFullName(userId: string, fullName: string) {
  const supabase = requireSupabase()
  const { error } = await supabase
    .from('profiles')
    .update({ full_name: fullName.trim() })
    .eq('id', userId)

  if (error) {
    throw new Error(`No se pudo actualizar el nombre del perfil: ${error.message}`)
  }
}
