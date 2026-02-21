import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface User {
  id: string;
  walletAddress: string;
  name?: string;
  email?: string;
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
            name: authData.name,
            email: authData.email,
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
