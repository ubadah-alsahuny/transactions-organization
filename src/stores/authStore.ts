import { create } from 'zustand';
import type { User } from '../types/auth';
import { ENV } from '../env';

interface AuthState {
  token: string | null;
  user: User | null;
  login: (userData: User) => void;
  logout: () => void;
  hydrate: () => void;
  isManager: () => boolean;
  isCoManager: () => boolean;
  isEmployee: () => boolean;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  token: localStorage.getItem(ENV.TOKEN_KEY),
  user: (() => {
    const raw = localStorage.getItem(ENV.USER_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as User;
    } catch {
      return null;
    }
  })(),
  login: (userData: User) => {
    localStorage.setItem(ENV.TOKEN_KEY, userData.token);
    localStorage.setItem(ENV.USER_KEY, JSON.stringify(userData));
    localStorage.setItem(ENV.ROLE_KEY, userData.role);
    if (userData.institution?.id) localStorage.setItem(ENV.INSTITUTION_ID_KEY, userData.institution.id);
    if (userData.institution?.name) localStorage.setItem(ENV.INSTITUTION_NAME_KEY, userData.institution.name);
    if (userData.section?.id) localStorage.setItem(ENV.SECTION_ID_KEY, userData.section.id);
    if (userData.section?.name) localStorage.setItem(ENV.SECTION_NAME_KEY, userData.section.name);
    set({ token: userData.token, user: userData });
  },
  logout: () => {
    localStorage.removeItem(ENV.TOKEN_KEY);
    localStorage.removeItem(ENV.USER_KEY);
    localStorage.removeItem(ENV.ROLE_KEY);
    localStorage.removeItem(ENV.INSTITUTION_ID_KEY);
    localStorage.removeItem(ENV.INSTITUTION_NAME_KEY);
    localStorage.removeItem(ENV.SECTION_ID_KEY);
    localStorage.removeItem(ENV.SECTION_NAME_KEY);
    set({ token: null, user: null });
  },
  hydrate: () => {
    const token = localStorage.getItem(ENV.TOKEN_KEY);
    const rawUser = localStorage.getItem(ENV.USER_KEY);
    let user: User | null = null;
    if (rawUser) {
      try {
        user = JSON.parse(rawUser) as User;
      } catch {
        user = null;
      }
    }
    set({ token, user });
  },
  isManager: () => get().user?.role === 'manager',
  isCoManager: () => get().user?.role === 'co_manager',
  isEmployee: () => get().user?.role === 'employee',
}));
