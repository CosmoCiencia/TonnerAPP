import { Navigate, useLocation } from 'react-router-dom'
import type { ReactNode } from 'react'

import { useAuth } from './useAuth'
import type { UserRole } from './auth.types'

type GuardProps = {
  children: ReactNode
}

export function RequireAuth({ children }: GuardProps) {
  const auth = useAuth()
  const location = useLocation()

  if (auth.status === 'loading') {
    return null
  }

  if (auth.status === 'guest') {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  if (auth.user?.status === 'pending') {
    return <Navigate to="/pending-approval" replace />
  }

  if (auth.user?.status === 'blocked') {
    return <Navigate to="/access-denied" replace />
  }

  return children
}

export function RequireRole({ children, roles }: GuardProps & { roles: UserRole[] }) {
  const auth = useAuth()
  const location = useLocation()

  if (auth.status === 'loading') {
    return null
  }

  if (auth.status === 'guest') {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  if (auth.user?.status === 'pending') {
    return <Navigate to="/pending-approval" replace />
  }

  if (!roles.includes(auth.role)) {
    return <Navigate to="/access-denied" replace />
  }

  return children
}
