'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount, useSignMessage } from 'wagmi';
import { useUIStore } from '@/store/uiStore';
import { useAuthStore } from '@/store/authStore';
import { useSimulationStore } from '@/store/simulationStore';

export default function LenderLoginPage() {
  const router = useRouter();
  const addToast = useUIStore((state) => state.addToast);
  const loginWithWallet = useAuthStore((state) => state.loginWithWallet);
  const setUserId = useSimulationStore((state) => state.setUserId);

  const { address, isConnected } = useAccount();
  const { signMessageAsync } = useSignMessage();

  // Handle wallet connection and authentication
  const handleAuthenticate = async () => {
    if (!address || !isConnected) {
      addToast({
        message: 'Please connect your wallet first',
        severity: 'warning',
      });
      return;
    }

    try {
      console.log('[LENDER AUTH] Starting authentication for wallet:', address);
      
      // Get nonce from backend
      const nonceResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/auth/nonce`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ wallet_address: address }),
      });

      console.log('[LENDER AUTH] Nonce response status:', nonceResponse.status);

      if (!nonceResponse.ok) {
        const errorText = await nonceResponse.text();
        console.error('[LENDER AUTH] Nonce error:', errorText);
        throw new Error('Failed to get authentication nonce');
      }

      const nonceData = await nonceResponse.json();
      console.log('[LENDER AUTH] Nonce data received:', nonceData);
      const { message } = nonceData;

      // Request signature from user
      console.log('[LENDER AUTH] Requesting signature for message:', message);
      const signature = await signMessageAsync({ message });
      console.log('[LENDER AUTH] Signature received:', signature);

      // Authenticate with backend
      console.log('[LENDER AUTH] Calling loginWithWallet...');
      await loginWithWallet(address, signature);
      console.log('[LENDER AUTH] loginWithWallet completed');

      // Get updated user state after authentication
      const authState = useAuthStore.getState();
      console.log('[LENDER AUTH] Auth state after login:', {
        isAuthenticated: authState.isAuthenticated,
        hasUser: !!authState.user,
        hasToken: !!authState.token,
        user: authState.user,
      });
      
      if (authState.isAuthenticated && authState.user) {
        // Update user role to LENDER
        authState.setUser({ ...authState.user, role: 'LENDER' });
        setUserId(authState.user.id);
        addToast({
          message: `Welcome, Lender!`,
          severity: 'success',
        });
        console.log('[LENDER AUTH] Redirecting to lender dashboard...');
        setTimeout(() => {
          router.push('/lender');
        }, 100);
      } else {
        console.error('[LENDER AUTH] User state not updated properly:', authState);
        throw new Error('Authentication succeeded but user state not updated');
      }
    } catch (error) {
      console.error('[LENDER AUTH] Authentication error:', error);
      addToast({
        message: error instanceof Error ? error.message : 'Authentication failed',
        severity: 'error',
      });
    }
  };

  return (
    <div className="min-h-screen bg-[color:var(--color-bg-primary)] grid grid-cols-1 md:grid-cols-2">
      {/* Left Panel - Branding */}
      <div className="hidden md:flex flex-col justify-between p-8 bg-[color:var(--color-bg-secondary)] border-r border-[color:var(--color-border)]">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#b367ff] rounded flex items-center justify-center text-sm font-bold text-white">LN</div>
          <span className="font-mono text-lg font-bold text-text-primary">cashnet <span className="text-[#b367ff]">lender</span></span>
        </Link>

        <div className="space-y-6">
          <div className="space-y-2">
            <div className="text-xs font-mono text-text-tertiary uppercase tracking-wider">Lender / Bank Portal</div>
            <h2 className="text-2xl font-bold font-mono text-text-primary">Liquidity Management</h2>
            <p className="text-sm text-text-secondary font-mono">Manage your liquidity positions, issue loans, monitor borrower health, and earn yield.</p>
          </div>
          <div className="space-y-2">
            {['Deposit & withdraw liquidity', 'Monitor loan portfolio', 'View borrower health factors', 'Trigger liquidations', 'Track interest earned'].map((f) => (
              <div key={f} className="flex items-center gap-2 text-sm font-mono text-text-secondary">
                <span className="text-[#b367ff]">◆</span> {f}
              </div>
            ))}
          </div>
          <div className="p-4 bg-[color:var(--color-bg-primary)] border border-[color:var(--color-border)] rounded text-xs font-mono space-y-1">
            <div className="text-accent">→ wallet authentication ready</div>
            <div className="text-success">✓ signature verification enabled</div>
            <div className="text-[#b367ff]">◆ TVL: $125,000,000</div>
          </div>
        </div>
        <div className="text-xs font-mono text-text-tertiary">
          New lender? <Link href="/lender/signup" className="text-[#b367ff] hover:underline">Register your institution →</Link>
        </div>
      </div>

      {/* Right Panel - Wallet Auth */}
      <div className="flex flex-col justify-center items-center p-8 md:p-12">
        <div className="w-full max-w-sm space-y-8">
          {/* Mobile Logo */}
          <Link href="/" className="md:hidden flex items-center gap-2 justify-center mb-8">
            <div className="w-10 h-10 bg-[#b367ff] rounded flex items-center justify-center text-sm font-bold text-white">LN</div>
            <span className="font-mono text-lg font-bold text-text-primary">cashnet <span className="text-[#b367ff]">lender</span></span>
          </Link>

          {/* Heading */}
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold font-mono text-text-primary">
              Lender Sign In
            </h1>
            <p className="text-text-secondary text-sm font-mono">
              Connect your wallet to access your institutional dashboard
            </p>
          </div>

          {/* Wallet Connection */}
          <div className="space-y-6">
            <div className="flex flex-col items-center gap-4 p-8 border border-[color:var(--color-border)] rounded-lg bg-[color:var(--color-bg-secondary)]">
              <div className="text-6xl mb-2">🦊</div>
              <h3 className="text-lg font-bold font-mono text-text-primary">
                MetaMask & Wallet Login
              </h3>
              <p className="text-text-secondary text-sm font-mono text-center">
                Sign a message with MetaMask or any Web3 wallet. No gas fees required.
              </p>
              <div className="text-xs text-text-secondary font-mono mt-2 p-3 bg-[color:var(--color-bg-primary)] rounded border border-[color:var(--color-border)]">
                💡 <strong>MetaMask users:</strong> Choose "Browser" for extension or "WalletConnect" for QR code (mobile)
              </div>
              
              <div className="w-full mt-4">
                <ConnectButton.Custom>
                  {({
                    account,
                    chain,
                    openAccountModal,
                    openChainModal,
                    openConnectModal,
                    authenticationStatus,
                    mounted,
                  }: any) => {
                    const ready = mounted && authenticationStatus !== 'loading';
                    const connected =
                      ready &&
                      account &&
                      chain &&
                      (!authenticationStatus || authenticationStatus === 'authenticated');

                    return (
                      <div
                        {...(!ready && {
                          'aria-hidden': true,
                          style: {
                            opacity: 0,
                            pointerEvents: 'none',
                            userSelect: 'none',
                          },
                        })}
                      >
                        {(() => {
                          if (!connected) {
                            return (
                              <button
                                onClick={openConnectModal}
                                type="button"
                                className="w-full py-3 bg-[#b367ff] hover:bg-[#9f4ef0] text-white rounded font-mono text-sm font-semibold transition-colors"
                              >
                                Connect Wallet
                              </button>
                            );
                          }

                          if (chain.unsupported) {
                            return (
                              <button
                                onClick={openChainModal}
                                type="button"
                                className="w-full py-3 border border-[#ff3860] text-[#ff3860] rounded font-mono text-sm font-semibold hover:bg-[rgba(255,56,96,0.1)] transition-colors"
                              >
                                Wrong network
                              </button>
                            );
                          }

                          return (
                            <div className="flex flex-col gap-3">
                              <div className="flex gap-2">
                                <button
                                  onClick={openChainModal}
                                  type="button"
                                  className="flex-1 py-2 text-xs border border-[color:var(--color-border)] rounded font-mono text-text-secondary hover:text-text-primary hover:border-[#b367ff] transition-colors"
                                >
                                  {chain.hasIcon && (
                                    <div
                                      style={{
                                        background: chain.iconBackground,
                                        width: 12,
                                        height: 12,
                                        borderRadius: 999,
                                        overflow: 'hidden',
                                        marginRight: 4,
                                        display: 'inline-block',
                                      }}
                                    >
                                      {chain.iconUrl && (
                                        <img
                                          alt={chain.name ?? 'Chain icon'}
                                          src={chain.iconUrl}
                                          style={{ width: 12, height: 12 }}
                                        />
                                      )}
                                    </div>
                                  )}
                                  {chain.name}
                                </button>

                                <button
                                  onClick={openAccountModal}
                                  type="button"
                                  className="flex-1 py-2 text-xs border border-[color:var(--color-border)] rounded font-mono text-text-secondary hover:text-text-primary hover:border-[#b367ff] transition-colors"
                                >
                                  {account.displayName}
                                </button>
                              </div>

                              <button
                                onClick={handleAuthenticate}
                                type="button"
                                className="w-full py-3 bg-[#b367ff] hover:bg-[#9f4ef0] text-white rounded font-mono text-sm font-semibold transition-colors"
                              >
                                Sign In with Wallet
                              </button>
                            </div>
                          );
                        })()}
                      </div>
                    );
                  }}
                </ConnectButton.Custom>
              </div>
            </div>

            {/* Security Notice */}
            <div className="bg-[rgba(179,103,255,0.05)] border border-[#b367ff] rounded-lg p-4">
              <div className="flex gap-3">
                <div className="text-[#b367ff] text-xl">🔒</div>
                <div className="space-y-1">
                  <h4 className="text-sm font-bold font-mono text-text-primary">
                    Secure & Non-Custodial
                  </h4>
                  <ul className="text-xs text-text-secondary font-mono space-y-1">
                    <li>• We never access your private keys</li>
                    <li>• You approve all transactions in your wallet</li>
                    <li>• Authentication is signature-based only</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Sign Up Link */}
          <div className="text-center text-xs font-mono text-text-tertiary">
            No account?{' '}
            <Link href="/lender/signup" className="text-[#b367ff] hover:underline">Register as Lender</Link>
            {' · '}
            <Link href="/login" className="text-accent hover:underline">Borrower login</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
