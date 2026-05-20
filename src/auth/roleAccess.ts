import type { AuthState, Permission, UserRole } from './auth.types'

export const authenticatedRoles: UserRole[] = ['customer', 'distributor', 'internal', 'admin']
export const privateRoles: UserRole[] = ['distributor', 'internal', 'admin']

export function hasPermission(auth: AuthState, permission: Permission) {
  return auth.permissions.includes(permission)
}

export function hasRole(auth: AuthState, roles: UserRole[]) {
  return roles.includes(auth.role)
}

export function canAccessCup(auth: AuthState) {
  return hasRole(auth, authenticatedRoles) && hasPermission(auth, 'cup.play')
}

export function canAccessPrivateTools(auth: AuthState) {
  return hasRole(auth, privateRoles) || hasPermission(auth, 'distributor.tools') || hasPermission(auth, 'internal.tools')
}
