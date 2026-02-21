'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { useUIStore } from '@/store/uiStore';

export default function LenderSignupPage() {
  const router = useRouter();
  const signup = useAuthStore((s) => s.signup);
  const loginWithGoogle = useAuthStore((s) => s.loginWithGoogle);
  const addToast = useUIStore((s) => s.addToast);
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name) e.name = 'Institution name is required';
    if (!form.email) e.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Invalid email';
    if (!form.password) e.password = 'Password is required';
    else if (form.password.length < 8) e.password = 'Minimum 8 characters';
    if (form.password !== form.confirm) e.confirm = 'Passwords do not match';
    return e;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;
    setLoading(true);
    try {
      await signup(form.email, form.password, form.name, 'LENDER');
      addToast({ message: 'Lender account created!', severity: 'success' });
      router.push('/lender');
    } catch {
      addToast({ message: 'Registration failed. Try again.', severity: 'error' });
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setLoading(true);
    try {
      await loginWithGoogle('LENDER');
      addToast({ message: 'Welcome, Lender', severity: 'success' });
      router.push('/lender');
    } catch {
      addToast({ message: 'Google authentication failed', severity: 'error' });
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[color:var(--color-bg-primary)] grid grid-cols-1 md:grid-cols-2">
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

      <div className="flex flex-col justify-center items-center p-8 md:p-12 overflow-y-auto">
        <div className="w-full max-w-sm space-y-6">
          <div className="space-y-1 text-center">
            <div className="w-12 h-12 bg-[#b367ff] rounded-lg flex items-center justify-center text-lg font-bold text-white mx-auto">LN</div>
            <h1 className="text-2xl font-bold font-mono text-text-primary">Register as Lender</h1>
            <p className="text-sm text-text-secondary font-mono">Create your institutional account</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {[
              { id: 'name', label: 'Institution / Bank Name', type: 'text', placeholder: 'Acme Bank Ltd.' },
              { id: 'email', label: 'Business Email', type: 'email', placeholder: 'ops@bank.com' },
              { id: 'password', label: 'Password', type: 'password', placeholder: '••••••••' },
              { id: 'confirm', label: 'Confirm Password', type: 'password', placeholder: '••••••••' },
            ].map((f) => (
              <div key={f.id}>
                <label className="block text-xs font-mono text-text-secondary mb-1">{f.label}</label>
                <input
                  type={f.type}
                  placeholder={f.placeholder}
                  value={(form as Record<string, string>)[f.id]}
                  onChange={(e) => setForm((p) => ({ ...p, [f.id]: e.target.value }))}
                  className="w-full px-3 py-2.5 bg-[color:var(--color-bg-secondary)] border border-[color:var(--color-border)] rounded text-sm font-mono text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-[#b367ff] transition-colors"
                />
                {errors[f.id] && <p className="text-xs text-[#ff3860] font-mono mt-1">{errors[f.id]}</p>}
              </div>
            ))}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-[#b367ff] hover:bg-[#9f4ef0] text-white rounded font-mono text-sm font-semibold transition-colors disabled:opacity-60"
            >
              {loading ? 'Creating account...' : 'Create Lender Account'}
            </button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-[color:var(--color-border)]" /></div>
            <div className="relative flex justify-center text-xs"><span className="px-2 bg-[color:var(--color-bg-primary)] text-text-tertiary font-mono">or</span></div>
          </div>

          <button onClick={handleGoogle} disabled={loading} className="w-full flex items-center justify-center gap-3 px-4 py-2.5 bg-white text-gray-800 rounded font-medium text-sm hover:bg-gray-100 transition-colors disabled:opacity-60">
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Sign up with Google
          </button>

          <div className="text-center text-xs font-mono text-text-tertiary">
            Already have an account? <Link href="/lender/login" className="text-[#b367ff] hover:underline">Sign in</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
