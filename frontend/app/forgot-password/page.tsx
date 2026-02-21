'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useUIStore } from '@/store/uiStore';

type ForgotStep = 'email' | 'success';

export default function ForgotPasswordPage() {
  const addToast = useUIStore((state) => state.addToast);

  const [step, setStep] = useState<ForgotStep>('email');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [countdown, setCountdown] = useState(60);

  useEffect(() => {
    if (step !== 'success') return;

    const timer = setInterval(() => {
      setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, [step]);

  const validateEmail = () => {
    if (!email) {
      setError('Email is required');
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Invalid email address');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateEmail()) return;

    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setStep('success');
      addToast({
        message: 'Recovery link sent to your email',
        severity: 'success',
      });
    }, 1500);
  };

  const handleResend = async () => {
    setLoading(true);
    setTimeout(() => {
      setCountdown(60);
      addToast({
        message: 'Recovery link resent',
        severity: 'success',
      });
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-[color:var(--color-bg-primary)] flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-sm space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <Link href="/" className="inline-flex items-center gap-2 justify-center mb-4">
            <div className="w-10 h-10 bg-accent rounded flex items-center justify-center text-base font-bold text-[color:var(--color-bg-primary)]">
              RE
            </div>
            <span className="font-mono text-lg font-bold text-text-primary">cashnet</span>
          </Link>
          <h1 className="text-3xl font-bold font-mono text-text-primary">
            Reset Password
          </h1>
          <p className="text-text-secondary text-sm font-mono">
            {step === 'email'
              ? 'Enter your email to receive a recovery link'
              : 'Check your email for instructions'}
          </p>
        </div>

        {/* Email Step */}
        {step === 'email' && (
          <form onSubmit={handleSubmit} className="card space-y-6">
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
                  if (error) setError('');
                }}
                className={`form-input ${error ? 'border-danger' : ''}`}
                placeholder="admin@cashnet.io"
              />
              {error && <p className="text-xs text-danger font-mono">{error}</p>}
            </div>

            <button type="submit" disabled={loading} className="btn accent w-full py-3">
              {loading ? 'Sending...' : 'Send Recovery Link'}
            </button>

            <div className="text-center">
              <Link
                href="/login"
                className="text-accent hover:text-accent-light transition-colors font-mono text-sm"
              >
                ← Back to Sign In
              </Link>
            </div>
          </form>
        )}

        {/* Success Step */}
        {step === 'success' && (
          <div className="card space-y-6">
            {/* Success Icon */}
            <div className="flex justify-center">
              <div className="w-16 h-16 bg-[rgba(0,212,99,0.1)] border border-success rounded-full flex items-center justify-center text-3xl">
                ✓
              </div>
            </div>

            {/* Message */}
            <div className="space-y-2 text-center">
              <p className="text-text-secondary font-mono text-sm">
                We've sent a password recovery link to
              </p>
              <p className="text-text-primary font-mono font-bold">{email}</p>
              <p className="text-text-tertiary font-mono text-xs">
                Check your email and click the link to reset your password
              </p>
            </div>

            {/* Countdown */}
            <div className="bg-[color:var(--color-bg-accent)] border border-[color:var(--color-border)] rounded p-4 text-center">
              <p className="text-xs text-text-tertiary font-mono mb-2">
                RESEND AVAILABLE IN
              </p>
              <p className="text-2xl font-bold font-mono text-accent">
                {countdown}s
              </p>
            </div>

            {/* Buttons */}
            <div className="space-y-3">
              <button
                onClick={handleResend}
                disabled={countdown > 0 || loading}
                className="btn outline w-full py-3 disabled:opacity-50"
              >
                {loading ? 'Resending...' : 'Resend Link'}
              </button>

              <div className="text-center">
                <Link
                  href="/login"
                  className="text-accent hover:text-accent-light transition-colors font-mono text-sm"
                >
                  Back to Sign In
                </Link>
              </div>
            </div>

            {/* Help Text */}
            <div className="pt-4 border-t border-[color:var(--color-border)] text-center">
              <p className="text-text-tertiary text-xs font-mono">
                Didn't receive the email? Check your spam folder or contact support.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
