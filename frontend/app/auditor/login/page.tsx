'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { useUIStore } from '@/store/uiStore';

export default function AuditorLoginPage() {
  const router = useRouter();
  const loginWithGoogle = useAuthStore((s) => s.loginWithGoogle);
  const addToast = useUIStore((s) => s.addToast);
  const [loading, setLoading] = useState(false);

  const handleGoogle = async () => {
    setLoading(true);
    try {
      await loginWithGoogle('AUDITOR');
      addToast({ message: 'Welcome, Auditor', severity: 'success' });
      router.push('/auditor');
    } catch {
      addToast({ message: 'Google authentication failed', severity: 'error' });
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[color:var(--color-bg-primary)] grid grid-cols-1 md:grid-cols-2">
      <div className="hidden md:flex flex-col justify-between p-8 bg-[color:var(--color-bg-secondary)] border-r border-[color:var(--color-border)]">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#f0a500] rounded flex items-center justify-center text-sm font-bold text-white">AU</div>
          <span className="font-mono text-lg font-bold text-text-primary">cashnet <span className="text-[#f0a500]">auditor</span></span>
        </Link>
        <div className="space-y-6">
          <div className="space-y-2">
            <div className="text-xs font-mono text-text-tertiary uppercase tracking-wider">Auditor Portal</div>
            <h2 className="text-2xl font-bold font-mono text-text-primary">Audit & Compliance</h2>
            <p className="text-sm text-text-secondary font-mono">Read-only access to the full audit trail. Monitor events, detect fraud, export compliance reports.</p>
          </div>
          <div className="space-y-2">
            {['Full audit event log', 'Fraud detection alerts', 'Credit score history', 'Export PDF reports', 'Simulation comparison'].map((f) => (
              <div key={f} className="flex items-center gap-2 text-sm font-mono text-text-secondary">
                <span className="text-[#f0a500]">◆</span> {f}
              </div>
            ))}
          </div>
          <div className="p-4 bg-[color:var(--color-bg-primary)] border border-[color:var(--color-border)] rounded text-xs font-mono space-y-1">
            <div className="text-[#f0a500]">◆ 247 events recorded</div>
            <div className="text-[#ff3860]">⚠ 3 active alerts</div>
            <div className="text-success">✓ last audit: 2 hours ago</div>
          </div>
        </div>
        <div className="flex gap-2">
          <span className="px-3 py-1 bg-[rgba(240,165,0,0.1)] border border-[#f0a500] text-[#f0a500] rounded text-xs font-mono">AUDITOR</span>
          <span className="px-3 py-1 bg-[rgba(0,212,99,0.1)] border border-success text-success rounded text-xs font-mono">read-only</span>
        </div>
      </div>

      <div className="flex flex-col justify-center items-center p-8 md:p-12">
        <div className="w-full max-w-sm space-y-8">
          <div className="space-y-2">
            <div className="w-12 h-12 bg-[#f0a500] rounded-lg flex items-center justify-center text-lg font-bold text-white mx-auto">AU</div>
            <h1 className="text-2xl font-bold font-mono text-text-primary text-center">Auditor Sign In</h1>
            <p className="text-sm text-text-secondary font-mono text-center">Access is restricted to authorized auditors</p>
          </div>

          <div className="space-y-4">
            <button
              onClick={handleGoogle}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-white text-gray-800 rounded font-medium text-sm hover:bg-gray-100 transition-colors disabled:opacity-60"
            >
              {loading ? (
                <span className="font-mono text-sm text-gray-600">Authenticating...</span>
              ) : (
                <>
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Continue with Google
                </>
              )}
            </button>

            <div className="p-3 bg-[rgba(240,165,0,0.05)] border border-[rgba(240,165,0,0.2)] rounded text-xs font-mono text-text-secondary text-center">
              Auditor accounts are provisioned by the system administrator. Contact admin if you need access.
            </div>
          </div>

          <div className="text-center text-xs font-mono text-text-tertiary">
            <Link href="/login" className="text-accent hover:underline">Borrower login</Link>
            {' · '}
            <Link href="/lender/login" className="text-[#b367ff] hover:underline">Lender login</Link>
            {' · '}
            <Link href="/admin/login" className="text-[#ff3860] hover:underline">Admin login</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
