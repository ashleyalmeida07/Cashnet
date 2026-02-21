'use client';

import React from 'react';

const kpis = [
  { label: 'Total Participants', value: '128', sub: '+4 this week', color: '#ff3860' },
  { label: 'Active Contracts', value: '6', sub: 'All systems live', color: '#00d4ff' },
  { label: 'Fraud Alerts', value: '3', sub: '2 critical', color: '#f0a500' },
  { label: 'Total Value Locked', value: '$2.4M', sub: '↑ 12% 7d', color: '#22c55e' },
];

const roleBreakdown = [
  { role: 'BORROWER', count: 94, color: '#00d4ff' },
  { role: 'LENDER', count: 22, color: '#b367ff' },
  { role: 'AUDITOR', count: 8, color: '#f0a500' },
  { role: 'ADMIN', count: 4, color: '#ff3860' },
];

const contracts = [
  { name: 'LendingPool', status: 'active', address: '0x1a2b...3c4d' },
  { name: 'CollateralVault', status: 'active', address: '0x2b3c...4d5e' },
  { name: 'CreditRegistry', status: 'active', address: '0x3c4d...5e6f' },
  { name: 'IdentityRegistry', status: 'active', address: '0x4d5e...6f7a' },
  { name: 'LiquidityPool', status: 'active', address: '0x5e6f...7a8b' },
  { name: 'AccessControl', status: 'paused', address: '0x6f7a...8b9c' },
];

const recentRegistrations = [
  { wallet: '0xabc1...ef23', role: 'BORROWER', status: 'verified', time: '2m ago' },
  { wallet: '0xdef4...gh56', role: 'LENDER', status: 'pending', time: '14m ago' },
  { wallet: '0x789a...bc01', role: 'BORROWER', status: 'verified', time: '1h ago' },
  { wallet: '0x456d...ef78', role: 'AUDITOR', status: 'verified', time: '3h ago' },
  { wallet: '0x123g...hi90', role: 'BORROWER', status: 'flagged', time: '6h ago' },
];

const statusColor: Record<string, string> = {
  verified: '#22c55e', pending: '#f0a500', flagged: '#ff3860',
};

const contractStatusColor: Record<string, string> = {
  active: '#22c55e', paused: '#ff3860',
};

export default function AdminPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold font-mono text-text-primary">System Overview</h1>
        <p className="text-sm text-text-tertiary font-mono mt-1">Rust-eze Simulation Lab · Admin Console</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((k) => (
          <div key={k.label} className="rounded-lg border border-[color:var(--color-border)] bg-[color:var(--color-bg-secondary)] p-4">
            <div className="text-xs font-mono text-text-tertiary mb-2">{k.label}</div>
            <div className="text-3xl font-bold font-mono" style={{ color: k.color }}>{k.value}</div>
            <div className="text-xs font-mono text-text-tertiary mt-1">{k.sub}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Role Breakdown */}
        <div className="rounded-lg border border-[color:var(--color-border)] bg-[color:var(--color-bg-secondary)] p-5">
          <h2 className="text-sm font-mono font-bold text-text-primary mb-4">Participant Breakdown</h2>
          <div className="space-y-3">
            {roleBreakdown.map((r) => (
              <div key={r.role} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ background: r.color }} />
                  <span className="text-xs font-mono text-text-secondary">{r.role}</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-24 h-1.5 bg-[color:var(--color-bg-primary)] rounded-full overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${(r.count / 128) * 100}%`, background: r.color }} />
                  </div>
                  <span className="text-xs font-mono" style={{ color: r.color }}>{r.count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Contract Status */}
        <div className="rounded-lg border border-[color:var(--color-border)] bg-[color:var(--color-bg-secondary)] p-5">
          <h2 className="text-sm font-mono font-bold text-text-primary mb-4">Smart Contracts</h2>
          <div className="space-y-2">
            {contracts.map((c) => (
              <div key={c.name} className="flex items-center justify-between py-1">
                <div>
                  <div className="text-xs font-mono text-text-primary">{c.name}</div>
                  <div className="text-xs font-mono text-text-tertiary">{c.address}</div>
                </div>
                <span className="text-xs font-mono px-2 py-0.5 rounded" style={{ color: contractStatusColor[c.status], border: `1px solid ${contractStatusColor[c.status]}`, background: `${contractStatusColor[c.status]}1a` }}>
                  {c.status.toUpperCase()}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="rounded-lg border border-[color:var(--color-border)] bg-[color:var(--color-bg-secondary)] p-5">
          <h2 className="text-sm font-mono font-bold text-text-primary mb-4">Quick Actions</h2>
          <div className="space-y-3">
            <button className="w-full py-3 font-mono text-sm bg-[rgba(255,56,96,0.1)] border border-[#ff3860] text-[#ff3860] rounded hover:bg-[rgba(255,56,96,0.2)] transition-colors">
              ⏸ Pause All Contracts
            </button>
            <button className="w-full py-3 font-mono text-sm bg-[rgba(0,212,255,0.1)] border border-[#00d4ff] text-[#00d4ff] rounded hover:bg-[rgba(0,212,255,0.2)] transition-colors">
              ▶ Run Simulation
            </button>
            <button className="w-full py-3 font-mono text-sm bg-[rgba(34,197,94,0.1)] border border-[#22c55e] text-[#22c55e] rounded hover:bg-[rgba(34,197,94,0.2)] transition-colors">
              ⊕ Register Wallet
            </button>
            <button className="w-full py-3 font-mono text-sm bg-[rgba(240,165,0,0.1)] border border-[#f0a500] text-[#f0a500] rounded hover:bg-[rgba(240,165,0,0.2)] transition-colors">
              ⬇ Export Audit Log
            </button>
          </div>
        </div>
      </div>

      {/* Recent Registrations */}
      <div className="rounded-lg border border-[color:var(--color-border)] bg-[color:var(--color-bg-secondary)] p-5">
        <h2 className="text-sm font-mono font-bold text-text-primary mb-4">Recent Wallet Registrations</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-xs font-mono">
            <thead>
              <tr className="text-text-tertiary border-b border-[color:var(--color-border)]">
                <th className="text-left py-2 pr-6">Wallet</th>
                <th className="text-left py-2 pr-6">Role</th>
                <th className="text-left py-2 pr-6">Status</th>
                <th className="text-left py-2">Time</th>
              </tr>
            </thead>
            <tbody>
              {recentRegistrations.map((r, i) => (
                <tr key={i} className="border-b border-[color:var(--color-border)] last:border-0">
                  <td className="py-3 pr-6 text-text-primary">{r.wallet}</td>
                  <td className="py-3 pr-6 text-[#00d4ff]">{r.role}</td>
                  <td className="py-3 pr-6">
                    <span className="px-2 py-0.5 rounded" style={{ color: statusColor[r.status], border: `1px solid ${statusColor[r.status]}`, background: `${statusColor[r.status]}1a` }}>
                      {r.status}
                    </span>
                  </td>
                  <td className="py-3 text-text-tertiary">{r.time}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
