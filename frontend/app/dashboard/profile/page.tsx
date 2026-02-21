'use client';

import React, { useState } from 'react';
import Badge from '@/components/Badge';
import { useUIStore } from '@/store/uiStore';

export default function ProfilePage() {
  const addToast = useUIStore((state) => state.addToast);

  const [profile, setProfile] = useState({
    name: 'Alice Chen',
    email: 'alice@cashnet.io',
    organization: 'Institutional Research',
    role: 'Admin',
    wallet: '0x1A2B3C4D5E6F...',
    joinDate: '2024-01-01',
    status: 'active',
  });

  const [isEditing, setIsEditing] = useState(false);

  const handleSave = () => {
    setIsEditing(false);
    addToast({
      message: 'Profile updated successfully',
      severity: 'success',
    });
  };

  return (
    <div className="space-y-8 animate-fadeUp">
      <div>
        <h1 className="text-3xl font-bold font-mono text-text-primary mb-2">
          Profile
        </h1>
        <p className="text-text-secondary text-sm font-mono">
          User information and account details
        </p>
      </div>

      {/* Profile Header */}
      <div className="card space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="w-24 h-24 bg-accent rounded-full flex items-center justify-center text-4xl font-bold text-[color:var(--color-bg-primary)]">
              {profile.name.charAt(0)}
            </div>
            <div>
              <h2 className="text-2xl font-bold font-mono text-text-primary">
                {profile.name}
              </h2>
              <p className="text-text-secondary font-mono text-sm">{profile.organization}</p>
              <Badge variant="success" className="mt-2">
                {profile.status.toUpperCase()}
              </Badge>
            </div>
          </div>
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="btn ghost text-sm"
          >
            {isEditing ? 'Cancel' : 'Edit'}
          </button>
        </div>
      </div>

      {/* Profile Info Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Basic Info */}
        <div className="card space-y-4">
          <h3 className="text-sm font-mono font-bold text-text-primary uppercase">Basic Information</h3>
          <div className="space-y-4">
            <div>
              <label className="form-label text-xs">Full Name</label>
              {isEditing ? (
                <input
                  type="text"
                  value={profile.name}
                  onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                  className="form-input text-xs"
                />
              ) : (
                <p className="font-mono text-sm text-text-secondary">{profile.name}</p>
              )}
            </div>
            <div>
              <label className="form-label text-xs">Email</label>
              {isEditing ? (
                <input
                  type="email"
                  value={profile.email}
                  onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                  className="form-input text-xs"
                />
              ) : (
                <p className="font-mono text-sm text-text-secondary">{profile.email}</p>
              )}
            </div>
            <div>
              <label className="form-label text-xs">Organization</label>
              {isEditing ? (
                <input
                  type="text"
                  value={profile.organization}
                  onChange={(e) => setProfile({ ...profile, organization: e.target.value })}
                  className="form-input text-xs"
                />
              ) : (
                <p className="font-mono text-sm text-text-secondary">{profile.organization}</p>
              )}
            </div>
          </div>
          {isEditing && (
            <button onClick={handleSave} className="btn accent w-full text-xs py-2">
              Save Changes
            </button>
          )}
        </div>

        {/* Account Info */}
        <div className="card space-y-4">
          <h3 className="text-sm font-mono font-bold text-text-primary uppercase">Account Information</h3>
          <div className="space-y-4">
            <div>
              <label className="form-label text-xs">Role</label>
              <p className="font-mono text-sm text-text-secondary">{profile.role}</p>
            </div>
            <div>
              <label className="form-label text-xs">Wallet Address</label>
              <div className="flex items-center gap-2">
                <p className="font-mono text-sm text-text-secondary">{profile.wallet}</p>
                <button className="text-xs text-accent hover:text-accent-light">Copy</button>
              </div>
            </div>
            <div>
              <label className="form-label text-xs">Member Since</label>
              <p className="font-mono text-sm text-text-secondary">{profile.joinDate}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Activity Stats */}
      <div className="card space-y-4">
        <h3 className="text-sm font-mono font-bold text-text-primary uppercase">Activity</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-3 bg-[color:var(--color-bg-accent)] rounded text-center">
            <div className="text-xs text-text-tertiary font-mono">Simulations Run</div>
            <div className="text-2xl font-bold font-mono text-accent mt-1">42</div>
          </div>
          <div className="p-3 bg-[color:var(--color-bg-accent)] rounded text-center">
            <div className="text-xs text-text-tertiary font-mono">Total PnL</div>
            <div className="text-2xl font-bold font-mono text-success mt-1">+$4.2M</div>
          </div>
          <div className="p-3 bg-[color:var(--color-bg-accent)] rounded text-center">
            <div className="text-xs text-text-tertiary font-mono">Win Rate</div>
            <div className="text-2xl font-bold font-mono text-accent mt-1">73%</div>
          </div>
          <div className="p-3 bg-[color:var(--color-bg-accent)] rounded text-center">
            <div className="text-xs text-text-tertiary font-mono">Last Active</div>
            <div className="text-xs font-mono text-text-secondary mt-1">2 hours ago</div>
          </div>
        </div>
      </div>

      {/* Connected Services */}
      <div className="card space-y-4">
        <h3 className="text-sm font-mono font-bold text-text-primary uppercase">Connected Services</h3>
        <div className="space-y-2">
          {[
            { name: 'MetaMask', status: 'connected' },
            { name: 'Discord', status: 'connected' },
            { name: 'Email', status: 'connected' },
            { name: 'GitHub', status: 'disconnected' },
          ].map((service) => (
            <div
              key={service.name}
              className="flex items-center justify-between p-3 bg-[color:var(--color-bg-accent)] rounded"
            >
              <span className="font-mono text-sm text-text-primary">{service.name}</span>
              <div className="flex items-center gap-2">
                <Badge variant={service.status === 'connected' ? 'success' : 'medium'}>
                  {service.status === 'connected' ? 'Connected' : 'Disconnected'}
                </Badge>
                <button className="text-xs text-accent hover:text-accent-light font-mono">
                  {service.status === 'connected' ? 'Disconnect' : 'Connect'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
