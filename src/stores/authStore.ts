import { create } from 'zustand';
import type { User } from '../types/auth';
import { ENV } from '../env';

interface AuthState {
  token: string | null;
  user: User | null;
  login: (userData: User) => void;
  logout: () => void;
  isManager: () => boolean;
  isCoManager: () => boolean;
  isEmployee: () => boolean;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  token: localStorage.getItem(ENV.TOKEN_KEY),
  user: null, 
  login: (userData: User) => {
    localStorage.setItem(ENV.TOKEN_KEY, userData.token);
    set({ token: userData.token, user: userData });
  },
  logout: () => {
    localStorage.removeItem(ENV.TOKEN_KEY);
    set({ token: null, user: null });
  },
  isManager: () => get().user?.role === 'manager',
  isCoManager: () => get().user?.role === 'co_manager',
  isEmployee: () => get().user?.role === 'employee',
}));
