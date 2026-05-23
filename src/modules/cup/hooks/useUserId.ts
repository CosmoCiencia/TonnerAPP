import { useAuth } from '../../../auth/useAuth';

export function useUserId() {
  const auth = useAuth();

  return auth.user?.id ?? null;
}
