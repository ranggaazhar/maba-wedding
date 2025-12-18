// src/store/useAuthStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Admin } from '../api/Authapi';

interface AuthState {
  admin: Admin | null;
  token: string | null;
  isAuthenticated: boolean;
  setAuth: (admin: Admin, token: string) => void;
  clearAuth: () => void;
  updateAdmin: (admin: Admin) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      admin: null,
      token: null,
      isAuthenticated: false,

      setAuth: (admin, token) => {
        localStorage.setItem('token', token);
        localStorage.setItem('admin', JSON.stringify(admin));
        set({ admin, token, isAuthenticated: true });
      },

      clearAuth: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('admin');
        set({ admin: null, token: null, isAuthenticated: false });
      },

      updateAdmin: (admin) => {
        localStorage.setItem('admin', JSON.stringify(admin));
        set({ admin });
      },
    }),
    {
      name: 'auth-storage',
    }
  )
);