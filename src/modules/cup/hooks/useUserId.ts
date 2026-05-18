export function useUserId() {
  const tonnerWindow = window as Window & {
    __TONNER_CONTEXT__?: {
      user_id?: string
    }
  }

  return tonnerWindow.__TONNER_CONTEXT__?.user_id ?? 'tonner.demo.user'
}
