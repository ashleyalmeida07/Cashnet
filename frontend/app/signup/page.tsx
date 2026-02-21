'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useUIStore } from '@/store/uiStore';
import { useAuthStore } from '@/store/authStore';
import { useSimulationStore } from '@/store/simulationStore';

type SignupStep = 1 | 2 | 3;

interface FormData {
  email: string;
  password: string;
  confirmPassword: string;
  role: string;
  organization: string;
  wallet: string;
  network: string;
  duration: string;
  agents: number;
  notifications: boolean;
}

const ROLES = [
  { id: 'admin', label: 'Administrator', desc: 'Full system access' },
  { id: 'analyst', label: 'Risk Analyst', desc: 'View & analyze' },
  { id: 'trader', label: 'Trader', desc: 'Execute strategies' },
  { id: 'observer', label: 'Observer', desc: 'Read-only access' },
];

export default function SignupPage() {
  const router = useRouter();
  const addToast = useUIStore((state) => state.addToast);
  const signup = useAuthStore((state) => state.signup);
  const setUserId = useSimulationStore((state) => state.setUserId);

  const [step, setStep] = useState<SignupStep>(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    email: '',
    password: '',
    confirmPassword: '',
    role: 'analyst',
    organization: '',
    wallet: '',
    network: 'sepolia',
    duration: '3600',
    agents: 3,
    notifications: true,
  });
  const [errors, setErrors] = useState<Partial<FormData>>({});

  const updateField = (field: keyof FormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const validateStep1 = () => {
    const newErrors: Partial<FormData> = {};
    if (!formData.email) newErrors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = 'Invalid email';
    if (!formData.password) newErrors.password = 'Password is required';
    else if (formData.password.length < 8) newErrors.password = 'Password must be at least 8 characters';
    if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
    return newErrors;
  };

  const validateStep2 = () => {
    const newErrors: Partial<FormData> = {};
    if (!formData.role) newErrors.role = 'Role is required';
    if (!formData.organization) newErrors.organization = 'Organization is required';
    return newErrors;
  };

  const handleNextStep = () => {
    let newErrors: Partial<FormData> = {};
    if (step === 1) newErrors = validateStep1();
    else if (step === 2) newErrors = validateStep2();

    setErrors(newErrors);
    if (Object.keys(newErrors).length === 0 && step < 3) {
      setStep((step + 1) as SignupStep);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await signup(formData.email, formData.password, formData.email.split('@')[0]);
      const user = useAuthStore.getState().user;
      if (user) {
        setUserId(user.id);
        addToast({
          message: `Welcome, ${user.name}! Your account is ready.`,
          severity: 'success',
        });
        router.push('/dashboard');
      }
    } catch (error) {
      addToast({
        message: 'Account creation failed. Please try again.',
        severity: 'danger',
      });
      setLoading(false);
    }
  };

  const passwordStrength = () => {
    let strength = 0;
    if (formData.password.length >= 8) strength++;
    if (/[A-Z]/.test(formData.password)) strength++;
    if (/[0-9]/.test(formData.password)) strength++;
    if (/[^A-Za-z0-9]/.test(formData.password)) strength++;
    return strength;
  };

  const strengthColor = () => {
    const strength = passwordStrength();
    if (strength <= 1) return 'bg-danger';
    if (strength <= 2) return 'bg-warn';
    return 'bg-success';
  };

  return (
    <div className="min-h-screen bg-[color:var(--color-bg-primary)] flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-2xl space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <Link href="/" className="inline-flex items-center gap-2 justify-center mb-4">
            <div className="w-10 h-10 bg-accent rounded flex items-center justify-center text-base font-bold text-[color:var(--color-bg-primary)]">
              RE
            </div>
            <span className="font-mono text-lg font-bold text-text-primary">cashnet</span>
          </Link>
          <h1 className="text-3xl font-bold font-mono text-text-primary">
            Create Account
          </h1>
          <p className="text-text-secondary text-sm font-mono">
            Join the simulation platform
          </p>
        </div>

        {/* Progress Indicator */}
        <div className="flex gap-4">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center gap-2 flex-1">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center font-mono font-bold transition-colors ${
                  s <= step
                    ? 'bg-accent text-[color:var(--color-bg-primary)]'
                    : 'bg-[color:var(--color-bg-accent)] text-text-tertiary'
                }`}
              >
                {s}
              </div>
              <span className="text-xs font-mono text-text-secondary hidden sm:inline">
                {s === 1 ? 'Account' : s === 2 ? 'Profile' : 'Preferences'}
              </span>
            </div>
          ))}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="card space-y-6">
          {/* Step 1: Credentials */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="form-label">Email Address</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => updateField('email', e.target.value)}
                  className={`form-input ${errors.email ? 'border-danger' : ''}`}
                  placeholder="you@example.com"
                />
                {errors.email && (
                  <p className="text-xs text-danger font-mono">{errors.email}</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="form-label">Password</label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => updateField('password', e.target.value)}
                  className={`form-input ${errors.password ? 'border-danger' : ''}`}
                  placeholder="••••••••"
                />
                {formData.password && (
                  <div className="space-y-1">
                    <div className="h-1 bg-[color:var(--color-bg-accent)] rounded overflow-hidden">
                      <div
                        className={`h-full transition-all ${strengthColor()}`}
                        style={{ width: `${(passwordStrength() / 4) * 100}%` }}
                      />
                    </div>
                    <p className="text-xs text-text-tertiary font-mono">
                      {passwordStrength() <= 1 && 'Weak'}
                      {passwordStrength() === 2 && 'Fair'}
                      {passwordStrength() === 3 && 'Good'}
                      {passwordStrength() === 4 && 'Strong'}
                    </p>
                  </div>
                )}
                {errors.password && (
                  <p className="text-xs text-danger font-mono">{errors.password}</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="form-label">Confirm Password</label>
                <input
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => updateField('confirmPassword', e.target.value)}
                  className={`form-input ${errors.confirmPassword ? 'border-danger' : ''}`}
                  placeholder="••••••••"
                />
                {errors.confirmPassword && (
                  <p className="text-xs text-danger font-mono">{errors.confirmPassword}</p>
                )}
              </div>
            </div>
          )}

          {/* Step 2: Profile */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="form-label">Role</label>
                <div className="grid grid-cols-2 gap-3">
                  {ROLES.map((role) => (
                    <button
                      key={role.id}
                      type="button"
                      onClick={() => updateField('role', role.id)}
                      className={`p-3 border rounded transition-colors text-left ${
                        formData.role === role.id
                          ? 'bg-accent text-[color:var(--color-bg-primary)] border-accent'
                          : 'bg-[color:var(--color-bg-accent)] border-[color:var(--color-border)] hover:border-accent'
                      }`}
                    >
                      <div className="font-mono font-bold text-sm">{role.label}</div>
                      <div className="text-xs mt-1 opacity-70">{role.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="form-label">Organization</label>
                <input
                  type="text"
                  value={formData.organization}
                  onChange={(e) => updateField('organization', e.target.value)}
                  className={`form-input ${errors.organization ? 'border-danger' : ''}`}
                  placeholder="Your organization"
                />
                {errors.organization && (
                  <p className="text-xs text-danger font-mono">{errors.organization}</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="form-label">Wallet Address (Optional)</label>
                <input
                  type="text"
                  value={formData.wallet}
                  onChange={(e) => updateField('wallet', e.target.value)}
                  className="form-input"
                  placeholder="0x..."
                />
              </div>
            </div>
          )}

          {/* Step 3: Preferences */}
          {step === 3 && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="form-label">Network</label>
                  <select
                    value={formData.network}
                    onChange={(e) => updateField('network', e.target.value)}
                    className="form-input"
                  >
                    <option value="sepolia">Sepolia</option>
                    <option value="mainnet">Mainnet</option>
                    <option value="polygon">Polygon</option>
                    <option value="arbitrum">Arbitrum</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="form-label">Simulation Duration</label>
                  <select
                    value={formData.duration}
                    onChange={(e) => updateField('duration', e.target.value)}
                    className="form-input"
                  >
                    <option value="1800">30 minutes</option>
                    <option value="3600">1 hour</option>
                    <option value="7200">2 hours</option>
                    <option value="86400">24 hours</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="form-label">Number of Agents</label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={formData.agents}
                  onChange={(e) => updateField('agents', parseInt(e.target.value))}
                  className="w-full accent"
                />
                <div className="flex items-center justify-between text-sm text-text-secondary">
                  <span>1</span>
                  <span className="font-bold text-accent">{formData.agents} agents</span>
                  <span>10</span>
                </div>
              </div>

              <label className="flex items-center gap-3 cursor-pointer p-3 bg-[color:var(--color-bg-accent)] rounded">
                <input
                  type="checkbox"
                  checked={formData.notifications}
                  onChange={(e) => updateField('notifications', e.target.checked)}
                  className="accent"
                />
                <span className="text-sm font-mono">Enable event notifications</span>
              </label>
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-3 pt-4 border-t border-[color:var(--color-border)]">
            {step > 1 && (
              <button
                type="button"
                onClick={() => setStep((step - 1) as SignupStep)}
                className="btn ghost flex-1"
              >
                Back
              </button>
            )}
            {step < 3 ? (
              <button
                type="button"
                onClick={handleNextStep}
                className="btn accent flex-1"
              >
                Next
              </button>
            ) : (
              <button
                type="submit"
                disabled={loading}
                className="btn accent flex-1"
              >
                {loading ? 'Creating account...' : 'Create Account'}
              </button>
            )}
          </div>
        </form>

        {/* Sign In Link */}
        <div className="text-center">
          <p className="text-text-secondary text-sm font-mono">
            Already have an account?{' '}
            <Link
              href="/login"
              className="text-accent hover:text-accent-light transition-colors font-bold"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
