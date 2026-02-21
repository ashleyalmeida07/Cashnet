'use client';

import React, { useState } from 'react';
import { useUIStore } from '@/store/uiStore';

export default function SettingsPage() {
  const addToast = useUIStore((state) => state.addToast);
  
  const [settings, setSettings] = useState({
    emailAlerts: true,
    webhookAlerts: false,
    pushNotifications: true,
    theme: 'dark',
    currency: 'USD',
    language: 'en',
    twoFactor: false,
    apiKey: 'sk_live_abc123...',
  });

  const handleSave = (section: string) => {
    addToast({
      message: `${section} settings saved`,
      severity: 'success',
    });
  };

  return (
    <div className="space-y-8 animate-fadeUp">
      <div>
        <h1 className="text-3xl font-bold font-mono text-text-primary mb-2">
          Settings
        </h1>
        <p className="text-text-secondary text-sm font-mono">
          Preferences, API keys, and system configuration
        </p>
      </div>

      {/* Notification Settings */}
      <div className="card space-y-4">
        <h3 className="text-sm font-mono font-bold text-text-primary uppercase">Notifications</h3>
        <div className="space-y-3">
          <label className="flex items-center justify-between p-3 bg-[color:var(--color-bg-accent)] rounded cursor-pointer">
            <span className="font-mono text-sm text-text-primary">Email Alerts</span>
            <input
              type="checkbox"
              checked={settings.emailAlerts}
              onChange={(e) => setSettings({ ...settings, emailAlerts: e.target.checked })}
              className="accent"
            />
          </label>
          <label className="flex items-center justify-between p-3 bg-[color:var(--color-bg-accent)] rounded cursor-pointer">
            <span className="font-mono text-sm text-text-primary">Push Notifications</span>
            <input
              type="checkbox"
              checked={settings.pushNotifications}
              onChange={(e) => setSettings({ ...settings, pushNotifications: e.target.checked })}
              className="accent"
            />
          </label>
          <label className="flex items-center justify-between p-3 bg-[color:var(--color-bg-accent)] rounded cursor-pointer">
            <span className="font-mono text-sm text-text-primary">Webhook Alerts</span>
            <input
              type="checkbox"
              checked={settings.webhookAlerts}
              onChange={(e) => setSettings({ ...settings, webhookAlerts: e.target.checked })}
              className="accent"
            />
          </label>
        </div>
        <button onClick={() => handleSave('Notification')} className="btn accent w-full text-xs py-2">
          Save
        </button>
      </div>

      {/* Preferences */}
      <div className="card space-y-4">
        <h3 className="text-sm font-mono font-bold text-text-primary uppercase">Preferences</h3>
        <div className="space-y-3">
          <div className="space-y-2">
            <label className="form-label text-xs">Theme</label>
            <select
              value={settings.theme}
              onChange={(e) => setSettings({ ...settings, theme: e.target.value })}
              className="form-input text-xs"
            >
              <option value="dark">Dark</option>
              <option value="light">Light</option>
              <option value="auto">Auto</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="form-label text-xs">Currency</label>
            <select
              value={settings.currency}
              onChange={(e) => setSettings({ ...settings, currency: e.target.value })}
              className="form-input text-xs"
            >
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
              <option value="GBP">GBP</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="form-label text-xs">Language</label>
            <select
              value={settings.language}
              onChange={(e) => setSettings({ ...settings, language: e.target.value })}
              className="form-input text-xs"
            >
              <option value="en">English</option>
              <option value="es">Español</option>
              <option value="fr">Français</option>
            </select>
          </div>
        </div>
        <button onClick={() => handleSave('Preference')} className="btn accent w-full text-xs py-2">
          Save
        </button>
      </div>

      {/* Security */}
      <div className="card space-y-4">
        <h3 className="text-sm font-mono font-bold text-text-primary uppercase">Security</h3>
        <label className="flex items-center justify-between p-3 bg-[color:var(--color-bg-accent)] rounded cursor-pointer">
          <span className="font-mono text-sm text-text-primary">Two-Factor Authentication</span>
          <input
            type="checkbox"
            checked={settings.twoFactor}
            onChange={(e) => setSettings({ ...settings, twoFactor: e.target.checked })}
            className="accent"
          />
        </label>
        <button className="btn ghost w-full text-xs py-2">Change Password</button>
        <button className="btn ghost w-full text-xs py-2">View Sessions</button>
      </div>

      {/* API Keys */}
      <div className="card space-y-4">
        <h3 className="text-sm font-mono font-bold text-text-primary uppercase">API Keys</h3>
        <div className="p-3 bg-[color:var(--color-bg-accent)] rounded font-mono text-xs break-all">
          {settings.apiKey}
        </div>
        <div className="flex gap-2">
          <button className="btn ghost flex-1 text-xs py-2">Copy</button>
          <button className="btn ghost flex-1 text-xs py-2">Regenerate</button>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="card space-y-4 border-danger">
        <h3 className="text-sm font-mono font-bold text-danger uppercase">Danger Zone</h3>
        <button className="btn danger w-full text-xs py-2">Delete Account</button>
      </div>
    </div>
  );
}
