'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount, useSignMessage } from 'wagmi';
import { useUIStore } from '@/store/uiStore';
import { useAuthStore } from '@/store/authStore';

export default function LenderSignupPage() {
  const router = useRouter();
  const addToast = useUIStore((state) => state.addToast);
  const loginWithWallet = useAuthStore((state) => state.loginWithWallet);

  const { address, isConnected } = useAccount();
  const { signMessageAsync } = useSignMessage();

  const [institutionName, setInstitutionName] = useState('');
  const [email, setEmail] = useState('');

  // Handle wallet connection and signup
  const handleSignup = async () => {
    console.log('[LENDER SIGNUP] Starting signup process...');
    console.log('[LENDER SIGNUP] Address:', address, 'Is Connected:', isConnected);

    if (!address || !isConnected) {
      addToast({
        message: 'Please connect your wallet first',
        severity: 'warning',
      });
      return;
    }

    try {
      console.log('[LENDER SIGNUP] Fetching nonce for wallet:', address);
      
      // Get nonce from backend
      const nonceResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/auth/nonce`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ wallet_address: address }),
      });

      if (!nonceResponse.ok) {
        throw new Error('Failed to get authentication nonce');
      }

      const { message } = await nonceResponse.json();
      console.log('[LENDER SIGNUP] Nonce received, requesting signature...');

      // Request signature from user
      const signature = await signMessageAsync({ message });
      console.log('[LENDER SIGNUP] Signature obtained, authenticating with backend...');

      // Authenticate with backend (signup + login in one step)
      await loginWithWallet(address, signature, institutionName || undefined, email || undefined);

      // Get updated user state after authentication
      const authState = useAuthStore.getState();
      console.log('[LENDER SIGNUP] Auth state after wallet login:', authState);

      if (authState.isAuthenticated && authState.user) {
        // Set user role to LENDER
        authState.setUser({ ...authState.user, role: 'LENDER' });
        console.log('[LENDER SIGNUP] User role updated to LENDER');

        addToast({
          message: `Welcome to cashnet lender portal, ${authState.user.name || 'Lender'}!`,
          severity: 'success',
        });
        
        console.log('[LENDER SIGNUP] Redirecting to lender dashboard...');
        setTimeout(() => {
          router.push('/lender');
        }, 100);
      } else {
        console.error('[LENDER SIGNUP] User state not updated properly:', authState);
        throw new Error('Authentication succeeded but user state not updated');
      }
    } catch (error) {
      console.error('[LENDER SIGNUP] Signup error:', error);
      addToast({
        message: error instanceof Error ? error.message : 'Signup failed',
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
            <div className="text-xs font-mono text-text-tertiary uppercase tracking-wider">Institution Registration</div>
            <h2 className="text-2xl font-bold font-mono text-text-primary">Join as a Lender</h2>
            <p className="text-sm text-text-secondary font-mono">Register your institution to provide liquidity, issue loans, and earn yield in the simulation.</p>
          </div>

          {/* Features */}
          <div>
            <h3 className="text-text-primary font-mono font-bold text-sm mb-3">What you get:</h3>
            <ul className="space-y-2 text-text-secondary text-sm font-mono">
              <li className="flex items-start gap-2">
                <span className="text-[#b367ff]">◆</span>
                <span>Non-custodial wallet authentication</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#b367ff]">◆</span>
                <span>Manage liquidity positions</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#b367ff]">◆</span>
                <span>Monitor loan portfolio & health</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#b367ff]">◆</span>
                <span>Secure transaction approval</span>
              </li>
            </ul>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {[{ v: '$2.4B', l: 'Total TVL' }, { v: '8.2%', l: 'Avg APY' }, { v: '12', l: 'Active Lenders' }, { v: '97.8%', l: 'Repayment Rate' }].map((s) => (
              <div key={s.l} className="p-3 bg-[color:var(--color-bg-primary)] border border-[color:var(--color-border)] rounded">
                <div className="text-lg font-bold font-mono text-[#b367ff]">{s.v}</div>
                <div className="text-xs text-text-tertiary font-mono">{s.l}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="text-xs font-mono text-text-tertiary">
          Already registered? <Link href="/lender/login" className="text-[#b367ff] hover:underline">Sign in →</Link>
        </div>
      </div>

      {/* Right Panel - Signup Form */}
      <div className="flex flex-col justify-center items-center p-8 md:p-12 overflow-y-auto">
        <div className="w-full max-w-sm space-y-6">
          {/* Mobile Logo */}
          <Link href="/" className="md:hidden flex items-center gap-2 justify-center mb-4">
            <div className="w-10 h-10 bg-[#b367ff] rounded flex items-center justify-center text-sm font-bold text-white">LN</div>
            <span className="font-mono text-lg font-bold text-text-primary">cashnet <span className="text-[#b367ff]">lender</span></span>
          </Link>

          {/* Heading */}
          <div className="text-center space-y-2">
            <div className="text-5xl mb-2">🦊</div>
            <h1 className="text-2xl font-bold font-mono text-text-primary">
              Register as Lender
            </h1>
            <p className="text-text-secondary text-sm font-mono">
              Connect MetaMask or any wallet to join as a lender
            </p>
            <div className="text-xs text-text-secondary font-mono mt-3 p-3 bg-[color:var(--color-bg-primary)] rounded border border-[color:var(--color-border)] text-left">
              💡 <strong>MetaMask:</strong> Choose "Browser" for extension or "WalletConnect" for mobile QR
            </div>
          </div>

          {/* Optional Profile Info */}
          <div className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="institutionName" className="block text-xs font-mono text-text-secondary">
                Institution / Bank Name (Optional)
              </label>
              <input
                id="institutionName"
                type="text"
                value={institutionName}
                onChange={(e) => setInstitutionName(e.target.value)}
                className="w-full px-3 py-2.5 bg-[color:var(--color-bg-secondary)] border border-[color:var(--color-border)] rounded text-sm font-mono text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-[#b367ff] transition-colors"
                placeholder="Acme Bank Ltd."
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="email" className="block text-xs font-mono text-text-secondary">
                Business Email (Optional)
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2.5 bg-[color:var(--color-bg-secondary)] border border-[color:var(--color-border)] rounded text-sm font-mono text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-[#b367ff] transition-colors"
                placeholder="ops@bank.com"
              />
              <p className="text-xs text-text-tertiary font-mono">
                Optional: for notifications and updates
              </p>
            </div>
          </div>

          {/* Wallet Connection */}
          <div className="space-y-6">
            <div className="flex flex-col items-center gap-4 p-8 border border-[color:var(--color-border)] rounded-lg bg-[color:var(--color-bg-secondary)]">
              <div className="text-6xl mb-2">🦊</div>
              <h3 className="text-lg font-bold font-mono text-text-primary">
                Connect Your Wallet
              </h3>
              <p className="text-text-secondary text-sm font-mono text-center">
                Sign up with MetaMask or any Ethereum wallet. No passwords needed!
              </p>
              
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
                                onClick={handleSignup}
                                type="button"
                                className="w-full py-3 bg-[#b367ff] hover:bg-[#9f4ef0] text-white rounded font-mono text-sm font-semibold transition-colors"
                              >
                                Sign Up with Wallet
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

          {/* Sign In Link */}
          <div className="text-center text-xs font-mono text-text-tertiary">
            Already have an account?{' '}
            <Link href="/lender/login" className="text-[#b367ff] hover:underline">Sign in</Link>
            {' · '}
            <Link href="/signup" className="text-accent hover:underline">Borrower signup</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
