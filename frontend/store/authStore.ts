import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type UserRole = 'BORROWER' | 'LENDER' | 'ADMIN' | 'AUDITOR';

export interface User {
  id: string;
  walletAddress?: string;
  name?: string;
  email?: string;
  role: UserRole;
  plan: 'starter' | 'pro' | 'enterprise';
  createdAt: number;
  avatar?: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  token: string | null;
  loginWithWallet: (walletAddress: string, signature: string, name?: string, email?: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: (role: UserRole) => Promise<void>;
  signup: (email: string, password: string, name: string, role?: UserRole) => Promise<void>;
  logout: () => void;
  setUser: (user: User | null) => void;
  setError: (error: string | null) => void;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      loading: false,
      error: null,
      token: null,

      loginWithWallet: async (walletAddress: string, signature: string, name?: string, email?: string) => {
        set({ loading: true, error: null });
        try {
          console.log('[STORE] loginWithWallet called with:', { walletAddress, signature: signature.substring(0, 10) + '...', name, email });
          
          // Verify signature with backend (nonce already obtained by caller)
          const verifyResponse = await fetch(`${API_BASE_URL}/api/auth/verify`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              wallet_address: walletAddress,
              signature,
              name,
              email,
            }),
          });

          console.log('[STORE] Verify response status:', verifyResponse.status);

          if (!verifyResponse.ok) {
            const errorText = await verifyResponse.text();
            console.error('[STORE] Verify error response:', errorText);
            throw new Error('Signature verification failed');
          }

          const authData = await verifyResponse.json();
          console.log('[STORE] Auth data received:', authData);

          // Create user object
          const user: User = {
            id: walletAddress,
            walletAddress: authData.wallet_address,
            name: authData.name || undefined,
            email: authData.email || undefined,
            role: 'BORROWER',
            plan: 'starter',
            createdAt: new Date(authData.created_at).getTime(),
            avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${walletAddress}`,
          };

          console.log('[STORE] Setting user state:', user);

          set({
            user,
            token: authData.token,
            isAuthenticated: true,
            loading: false,
          });
          
          console.log('[STORE] User state updated successfully');
        } catch (error) {
          console.error('[STORE] Login error:', error);
          set({
            error: error instanceof Error ? error.message : 'Wallet authentication failed',
            loading: false,
          });
          throw error;
        }
      },

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

      loginWithGoogle: async (role: UserRole) => {
        set({ loading: true, error: null });
        try {
          await new Promise((resolve) => setTimeout(resolve, 900));
          const googleNames: Record<UserRole, string> = {
            ADMIN: 'System Admin',
            AUDITOR: 'Lead Auditor',
            LENDER: 'Lender',
            BORROWER: 'Borrower',
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
        set({ user: null, token: null, isAuthenticated: false, error: null });
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
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
