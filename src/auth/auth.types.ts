export type UserRole = 'guest' | 'customer' | 'distributor' | 'internal' | 'admin'

export type Permission =
  | 'cup.play'
  | 'cup.admin'
  | 'catalog.manage'
  | 'content.manage'
  | 'distributor.tools'
  | 'internal.tools'

export type ProfileStatus = 'active' | 'pending' | 'blocked'

export type AuthUser = {
  id: string
  email: string
  fullName: string
  role: Exclude<UserRole, 'guest'>
  status: ProfileStatus
  permissions: Permission[]
}

export type AuthState = {
  status: 'loading' | 'guest' | 'authenticated'
  user: AuthUser | null
  role: UserRole
  permissions: Permission[]
}

export type LoginInput = {
  email: string
  password: string
}

export type RegisterInput = LoginInput & {
  fullName: string
}
