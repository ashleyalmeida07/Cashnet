'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useUIStore } from '@/store/uiStore';
import { useAuthStore } from '@/store/authStore';
import { useSimulationStore } from '@/store/simulationStore';

export default function LoginPage() {
  const router = useRouter();
  const addToast = useUIStore((state) => state.addToast);
  const login = useAuthStore((state) => state.login);
  const setUserId = useSimulationStore((state) => state.setUserId);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const validateForm = () => {
    const newErrors: typeof errors = {};
    if (!email) newErrors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) newErrors.email = 'Invalid email';
    if (!password) newErrors.password = 'Password is required';
    return newErrors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors = validateForm();
    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      setLoading(true);
      try {
        await login(email, password);
        const user = useAuthStore.getState().user;
        if (user) {
          setUserId(user.id);
          addToast({
            message: `Welcome back, ${user.name}!`,
            severity: 'success',
          });
          router.push('/dashboard');
        }
      } catch (error) {
        addToast({
          message: 'Login failed. Please try again.',
          severity: 'danger',
        });
        setLoading(false);
      }
    }
  };

  const handleMetamask = async () => {
    setLoading(true);
    try {
      // Mock MetaMask login
      await login('metamask@wallet.eth', 'metamask_auth');
      const user = useAuthStore.getState().user;
      if (user) {
        setUserId(user.id);
        addToast({
          message: 'MetaMask wallet connected',
          severity: 'success',
        });
        router.push('/dashboard');
      }
    } catch (error) {
      addToast({
        message: 'MetaMask connection failed',
        severity: 'danger',
      });
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[color:var(--color-bg-primary)] grid grid-cols-1 md:grid-cols-2">
      {/* Left Panel - Branding (Hidden on mobile) */}
      <div className="hidden md:flex flex-col justify-between p-8 bg-gradient-to-b from-[color:var(--color-bg-secondary)] to-[color:var(--color-bg-primary)] border-r border-[color:var(--color-border)]">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-10 h-10 bg-accent rounded flex items-center justify-center text-base font-bold text-[color:var(--color-bg-primary)]">
            RE
          </div>
          <span className="font-mono text-lg font-bold text-text-primary">Rust-eze</span>
        </Link>

        <div className="space-y-8">
          {/* Animated Hex */}
          <div className="w-32 h-32 mx-auto">
            <div className="animate-float">
              <svg
                viewBox="0 0 100 100"
                className="w-full h-full text-accent"
              >
                <polygon
                  points="50,10 90,35 90,65 50,90 10,65 10,35"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1"
                />
                <polygon
                  points="50,25 75,40 75,60 50,75 25,60 25,40"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1"
                  opacity="0.5"
                />
              </svg>
            </div>
          </div>

          {/* Quote */}
          <div>
            <blockquote className="text-text-secondary italic font-mono text-sm">
              "Understanding systemic risk is the first step to managing it."
            </blockquote>
            <p className="text-text-tertiary text-xs mt-2">— Protocol Architecture</p>
          </div>

          {/* Mini Terminal */}
          <div className="bg-[color:var(--color-bg-primary)] border border-[color:var(--color-border)] rounded p-4 text-xs font-mono space-y-1">
            <div className="text-accent">→ system initialized</div>
            <div className="text-success">✓ network ready</div>
            <div className="text-warn">⚠ pending authentication</div>
          </div>

          {/* Status Pills */}
          <div className="flex gap-2">
            <span className="px-3 py-1 bg-[rgba(0,212,99,0.1)] border border-success text-success rounded text-xs font-mono">
              sepolia
            </span>
            <span className="px-3 py-1 bg-[rgba(0,212,255,0.1)] border border-accent text-accent rounded text-xs font-mono">
              testnet
            </span>
          </div>
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="flex flex-col justify-center items-center p-8 md:p-12">
        <div className="w-full max-w-sm space-y-8">
          {/* Mobile Logo */}
          <Link href="/" className="md:hidden flex items-center gap-2 justify-center mb-8">
            <div className="w-8 h-8 bg-accent rounded flex items-center justify-center text-xs font-bold text-[color:var(--color-bg-primary)]">
              RE
            </div>
            <span className="font-mono text-base font-bold text-text-primary">Rust-eze</span>
          </Link>

          {/* Heading */}
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold font-mono text-text-primary">
              Sign In
            </h1>
            <p className="text-text-secondary text-sm font-mono">
              Access the Rust-eze Simulation Lab
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div className="space-y-2">
              <label htmlFor="email" className="form-label">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }));
                }}
                className={`form-input ${errors.email ? 'border-danger' : ''}`}
                placeholder="admin@rust-eze.io"
              />
              {errors.email && (
                <p className="text-xs text-danger font-mono">{errors.email}</p>
              )}
            </div>

            {/* Password */}
            <div className="space-y-2">
              <label htmlFor="password" className="form-label">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errors.password) setErrors((prev) => ({ ...prev, password: undefined }));
                }}
                className={`form-input ${errors.password ? 'border-danger' : ''}`}
                placeholder="••••••••"
              />
              {errors.password && (
                <p className="text-xs text-danger font-mono">{errors.password}</p>
              )}
            </div>

            {/* Remember & Forgot */}
            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="accent" />
                <span className="text-text-secondary font-mono text-xs">
                  Remember me
                </span>
              </label>
              <Link
                href="/forgot-password"
                className="text-accent hover:text-accent-light transition-colors font-mono text-xs"
              >
                Forgot password?
              </Link>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="btn accent w-full py-3 mt-6"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-4">
            <div className="flex-1 h-px bg-[color:var(--color-border)]" />
            <span className="text-text-tertiary text-xs font-mono">OR</span>
            <div className="flex-1 h-px bg-[color:var(--color-border)]" />
          </div>

          {/* OAuth Buttons */}
          <div className="space-y-2">
            <button
              onClick={handleMetamask}
              disabled={loading}
              className="btn ghost w-full py-3 flex items-center justify-center gap-2"
            >
              <span>🦊</span>
              <span className="font-mono text-sm">MetaMask</span>
            </button>
            <button
              disabled={loading}
              className="btn ghost w-full py-3 flex items-center justify-center gap-2"
            >
              <span>🔵</span>
              <span className="font-mono text-sm">Google</span>
            </button>
          </div>

          {/* Sign Up Link */}
          <div className="text-center">
            <p className="text-text-secondary text-sm font-mono">
              Don't have an account?{' '}
              <Link
                href="/signup"
                className="text-accent hover:text-accent-light transition-colors font-bold"
              >
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
