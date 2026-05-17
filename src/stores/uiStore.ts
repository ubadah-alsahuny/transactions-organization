import type { ReactNode } from 'react';
import { create } from 'zustand';

interface UIState {
  headerActions: ReactNode | null;
  setHeaderActions: (actions: ReactNode | null) => void;
}

export const useUIStore = create<UIState>((set) => ({
  headerActions: null,
  setHeaderActions: (actions) => set({ headerActions: actions }),
}));
