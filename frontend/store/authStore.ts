import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'user' | 'admin';
  plan: 'starter' | 'pro' | 'enterprise';
  createdAt: number;
  avatar?: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name: string) => Promise<void>;
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
          // Simulate API call
          await new Promise((resolve) => setTimeout(resolve, 800));

          // Mock user data based on email
          const mockUser: User = {
            id: `user_${Math.random().toString(36).substr(2, 9)}`,
            email,
            name: email.split('@')[0].charAt(0).toUpperCase() + email.split('@')[0].slice(1),
            role: email.includes('admin') ? 'admin' : 'user',
            plan: email.includes('enterprise') ? 'enterprise' : email.includes('pro') ? 'pro' : 'starter',
            createdAt: Date.now(),
            avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`,
          };

          set({ user: mockUser, isAuthenticated: true, loading: false });
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Login failed',
            loading: false,
          });
          throw error;
        }
      },

      signup: async (email: string, password: string, name: string) => {
        set({ loading: true, error: null });
        try {
          await new Promise((resolve) => setTimeout(resolve, 800));

          const mockUser: User = {
            id: `user_${Math.random().toString(36).substr(2, 9)}`,
            email,
            name,
            role: 'user',
            plan: 'starter',
            createdAt: Date.now(),
            avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`,
          };

          set({ user: mockUser, isAuthenticated: true, loading: false });
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Signup failed',
            loading: false,
          });
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
