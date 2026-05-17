import { useEffect, type ReactNode } from 'react';
import { useAuthStore } from '../stores/authStore';

type AuthProviderProps = {
  children: ReactNode;
};

export default function AuthProvider({ children }: AuthProviderProps) {
  const hydrate = useAuthStore(state => state.hydrate);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  return children;
}

