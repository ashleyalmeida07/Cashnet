import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type UserRole = 'BORROWER' | 'LENDER' | 'ADMIN' | 'AUDITOR';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  plan: 'starter' | 'pro' | 'enterprise';
  createdAt: number;
  avatar?: string;
  token?: string; // JWT from backend (for Admin/Auditor)
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: (role: UserRole) => Promise<void>;
  loginWithGoogleCredential: (credential: string) => Promise<{ role: UserRole }>;
  signup: (email: string, password: string, name: string, role?: UserRole) => Promise<void>;
  logout: () => void;
  setUser: (user: User | null) => void;
  setError: (error: string | null) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      loading: false,
      error: null,

      login: async (email: string, password: string) => {
        set({ loading: true, error: null });
        try {
          await new Promise((resolve) => setTimeout(resolve, 800));
          const mockUser: User = {
            id: `user_${Math.random().toString(36).substr(2, 9)}`,
            email,
            name: email.split('@')[0].charAt(0).toUpperCase() + email.split('@')[0].slice(1),
            role: 'BORROWER',
            plan: 'starter',
            createdAt: Date.now(),
            avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`,
          };
          set({ user: mockUser, isAuthenticated: true, loading: false });
        } catch (error) {
          set({ error: error instanceof Error ? error.message : 'Login failed', loading: false });
          throw error;
        }
      },

      /**
       * Real Google SSO for Admin / Auditor.
       * Sends the Google ID token to the backend, which verifies it and checks
       * the `adminandauditor` table. Throws with { code: 'access_denied' } if
       * the user is not provisioned.
       */
      loginWithGoogleCredential: async (credential: string) => {
        set({ loading: true, error: null });
        try {
          const res = await fetch(`${API_BASE}/auth/google`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ credential }),
          });

          if (res.status === 403) {
            const body = await res.json();
            set({ loading: false });
            const err = new Error(body?.detail?.message ?? 'Access denied');
            (err as any).code = 'access_denied';
            throw err;
          }

          if (!res.ok) {
            set({ loading: false });
            throw new Error('Authentication failed');
          }

          const data = await res.json();
          const role = data.role as UserRole;

          const user: User = {
            id: data.uid,
            email: data.email,
            name: data.name,
            role,
            plan: role === 'ADMIN' ? 'enterprise' : 'starter',
            createdAt: Date.now(),
            avatar: data.picture || `https://api.dicebear.com/7.x/avataaars/svg?seed=${data.email}`,
            token: data.token,
          };

          set({ user, isAuthenticated: true, loading: false });
          return { role };
        } catch (error) {
          set({ loading: false });
          throw error;
        }
      },

      /** Mock Google login kept for Lender/Borrower flows that aren't yet on real auth */
      loginWithGoogle: async (role: UserRole) => {
        set({ loading: true, error: null });
        try {
          await new Promise((resolve) => setTimeout(resolve, 900));
          const googleNames: Record<UserRole, string> = {
            ADMIN: 'System Admin', AUDITOR: 'Lead Auditor', LENDER: 'Lender', BORROWER: 'Borrower',
          };
          const mockUser: User = {
            id: `${role.toLowerCase()}_${Math.random().toString(36).substr(2, 9)}`,
            email: `${role.toLowerCase()}@cashnet.io`,
            name: googleNames[role],
            role,
            plan: role === 'ADMIN' ? 'enterprise' : role === 'LENDER' ? 'pro' : 'starter',
            createdAt: Date.now(),
            avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${role}`,
          };
          set({ user: mockUser, isAuthenticated: true, loading: false });
        } catch (error) {
          set({ error: error instanceof Error ? error.message : 'Google auth failed', loading: false });
          throw error;
        }
      },

      signup: async (email: string, password: string, name: string, role: UserRole = 'BORROWER') => {
        set({ loading: true, error: null });
        try {
          await new Promise((resolve) => setTimeout(resolve, 800));
          const mockUser: User = {
            id: `user_${Math.random().toString(36).substr(2, 9)}`,
            email,
            name,
            role,
            plan: role === 'LENDER' ? 'pro' : 'starter',
            createdAt: Date.now(),
            avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`,
          };
          set({ user: mockUser, isAuthenticated: true, loading: false });
        } catch (error) {
          set({ error: error instanceof Error ? error.message : 'Signup failed', loading: false });
          throw error;
        }
      },

      logout: () => {
        set({ user: null, isAuthenticated: false, error: null });
      },

      setUser: (user: User | null) => {
        set({ user, isAuthenticated: !!user });
      },

      setError: (error: string | null) => {
        set({ error });
      },
    }),
    {
      name: 'auth-store',
      partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated }),
    }
  )
);
