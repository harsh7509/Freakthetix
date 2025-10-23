'use client';

import { create } from 'zustand';

export type AuthUser = {
  id: string;
  email: string;
  name?: string;
  role?: 'admin' | 'user' | string;
};

type AuthState = {
  user: AuthUser | null;
  loading: boolean;
  isAdmin: boolean;
  setUser: (u: AuthUser | null) => void;
  setLoading: (v: boolean) => void;
};

function isEqualUser(a: AuthUser | null, b: AuthUser | null) {
  return JSON.stringify(a) === JSON.stringify(b);
}

export const useAuth = create<AuthState>((set, get) => ({
  user: null,
  loading: true,
  isAdmin: false,

  setUser: (u) => {
    const prev = get().user;
    if (isEqualUser(prev, u)) return; // 🛑 no-op if same value
    set({
      user: u,
      isAdmin: (u?.role ?? 'user') === 'admin',
    });
  },

  setLoading: (v) => {
    if (get().loading === v) return; // 🛑 no-op if same value
    set({ loading: v });
  },
}));
