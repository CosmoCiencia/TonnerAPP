type LocationState = {
  from?: {
    pathname?: string
  }
}

export function getRedirectPath(state: unknown) {
  const locationState = state as LocationState | null
  return locationState?.from?.pathname ?? '/'
}
