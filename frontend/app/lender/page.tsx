'use client';

import React from 'react';

const kpis = [
  { label: 'My Liquidity', value: '$480K', sub: 'In active pool', color: '#b367ff' },
  { label: 'Interest Earned', value: '$12,340', sub: '↑ 8.4% APY', color: '#22c55e' },
  { label: 'Active Loans', value: '34', sub: '2 overdue', color: '#00d4ff' },
  { label: 'At-Risk Borrowers', value: '5', sub: 'HF < 1.2', color: '#f0a500' },
];

const poolStats = [
  { label: 'Total Pool Reserves', value: '$2.1M', color: '#b367ff' },
  { label: 'Available Liquidity', value: '$680K', color: '#22c55e' },
  { label: 'Utilization Rate', value: '67.6%', color: '#00d4ff' },
  { label: 'Avg Loan Size', value: '$18,200', color: '#f0a500' },
];

const loans = [
  { borrower: '0xabc1...ef23', amount: '$24,000', health: 1.8, status: 'healthy', due: '2025-09-01' },
  { borrower: '0xdef4...gh56', amount: '$8,500', health: 1.15, status: 'at-risk', due: '2025-08-14' },
  { borrower: '0x789a...bc01', amount: '$35,000', health: 2.1, status: 'healthy', due: '2025-10-20' },
  { borrower: '0x456d...ef78', amount: '$5,200', health: 0.92, status: 'critical', due: '2025-07-30' },
  { borrower: '0x123g...hi90', amount: '$16,800', health: 1.55, status: 'healthy', due: '2025-11-05' },
  { borrower: '0xbcd2...fg34', amount: '$42,000', health: 1.3, status: 'watch', due: '2025-08-28' },
];

const healthColor = (h: number) => {
  if (h >= 1.5) return '#22c55e';
  if (h >= 1.2) return '#f0a500';
  return '#ff3860';
};

const statusColor: Record<string, string> = {
  healthy: '#22c55e', watch: '#f0a500', 'at-risk': '#f0a500', critical: '#ff3860',
};

export default function LenderPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold font-mono text-text-primary">Lender Dashboard</h1>
        <p className="text-sm text-text-tertiary font-mono mt-1">Liquidity overview · Loan portfolio · Borrower health</p>
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
        {/* Pool Stats */}
        <div className="rounded-lg border border-[color:var(--color-border)] bg-[color:var(--color-bg-secondary)] p-5">
          <h2 className="text-sm font-mono font-bold text-text-primary mb-4">Pool Reserves</h2>
          <div className="space-y-4">
            {poolStats.map((s) => (
              <div key={s.label}>
                <div className="flex justify-between mb-1">
                  <span className="text-xs font-mono text-text-tertiary">{s.label}</span>
                  <span className="text-xs font-mono font-bold" style={{ color: s.color }}>{s.value}</span>
                </div>
                <div className="h-1.5 bg-[color:var(--color-bg-primary)] rounded-full overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: '100%', background: `${s.color}40` }} />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-3 border-t border-[color:var(--color-border)]">
            <div className="text-xs font-mono text-text-tertiary mb-2">Utilization</div>
            <div className="h-2 bg-[color:var(--color-bg-primary)] rounded-full overflow-hidden">
              <div className="h-full rounded-full bg-[#b367ff]" style={{ width: '67.6%' }} />
            </div>
            <div className="text-xs font-mono text-[#b367ff] mt-1">67.6% utilized</div>
          </div>
        </div>

        {/* Yield Chart placeholder */}
        <div className="lg:col-span-2 rounded-lg border border-[color:var(--color-border)] bg-[color:var(--color-bg-secondary)] p-5">
          <h2 className="text-sm font-mono font-bold text-text-primary mb-4">Interest Earned (30d)</h2>
          <div className="h-48 flex items-end gap-1.5">
            {[4200, 3800, 5100, 4600, 5500, 4900, 6200, 5800, 6800, 7100, 6400, 7800, 8200, 7600, 9100,
              8700, 9500, 10200, 9800, 11100, 10600, 12000, 11500, 12800, 12200, 13400, 12900, 13900, 13500, 14200].map((v, i) => (
              <div key={i} className="flex-1 rounded-t" style={{ height: `${(v / 15000) * 100}%`, background: i === 29 ? '#b367ff' : 'rgba(179,103,255,0.25)' }} />
            ))}
          </div>
          <div className="flex justify-between text-xs font-mono text-text-tertiary mt-2">
            <span>30d ago</span>
            <span className="text-[#22c55e] font-bold">+$14,200 this month</span>
            <span>today</span>
          </div>
        </div>
      </div>

      {/* Loan Portfolio Table */}
      <div className="rounded-lg border border-[color:var(--color-border)] bg-[color:var(--color-bg-secondary)] p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-mono font-bold text-text-primary">Active Loan Portfolio</h2>
          <button className="text-xs font-mono text-[#b367ff] border border-[#b367ff] px-3 py-1 rounded hover:bg-[rgba(179,103,255,0.1)] transition-colors">
            View All
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs font-mono">
            <thead>
              <tr className="text-text-tertiary border-b border-[color:var(--color-border)]">
                <th className="text-left py-2 pr-6">Borrower</th>
                <th className="text-left py-2 pr-6">Amount</th>
                <th className="text-left py-2 pr-6">Health Factor</th>
                <th className="text-left py-2 pr-6">Status</th>
                <th className="text-left py-2">Due Date</th>
              </tr>
            </thead>
            <tbody>
              {loans.map((l, i) => (
                <tr key={i} className="border-b border-[color:var(--color-border)] last:border-0 hover:bg-[color:var(--color-bg-primary)] transition-colors">
                  <td className="py-3 pr-6 text-text-primary">{l.borrower}</td>
                  <td className="py-3 pr-6 text-[#b367ff] font-bold">{l.amount}</td>
                  <td className="py-3 pr-6">
                    <div className="flex items-center gap-2">
                      <span style={{ color: healthColor(l.health) }}>{l.health.toFixed(2)}</span>
                      <div className="w-16 h-1.5 bg-[color:var(--color-bg-primary)] rounded-full overflow-hidden">
                        <div className="h-full rounded-full" style={{ width: `${Math.min((l.health / 3) * 100, 100)}%`, background: healthColor(l.health) }} />
                      </div>
                    </div>
                  </td>
                  <td className="py-3 pr-6">
                    <span className="px-2 py-0.5 rounded text-xs" style={{ color: statusColor[l.status], border: `1px solid ${statusColor[l.status]}`, background: `${statusColor[l.status]}1a` }}>
                      {l.status}
                    </span>
                  </td>
                  <td className="py-3 text-text-tertiary">{l.due}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
