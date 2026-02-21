'use client';

import React, { useEffect, useState } from 'react';
import { useThreatStore, ThreatAlert } from '@/store/threatStore';
import { generateThreatScores, generateThreatAlerts } from '@/lib/mockData';

const severityConfig: Record<string, { color: string; bg: string; label: string }> = {
  low:      { color: '#22c55e', bg: '#22c55e1a', label: 'LOW' },
  medium:   { color: '#f0a500', bg: '#f0a5001a', label: 'MED' },
  high:     { color: '#ff3860', bg: '#ff38601a', label: 'HIGH' },
  critical: { color: '#ff0033', bg: '#ff00331a', label: 'CRIT' },
};

const riskConfig: Record<string, { color: string; label: string; icon: string }> = {
  low:      { color: '#22c55e', label: 'LOW RISK',      icon: '✓' },
  medium:   { color: '#f0a500', label: 'MEDIUM RISK',   icon: '⚠' },
  high:     { color: '#ff3860', label: 'HIGH RISK',     icon: '⚡' },
  critical: { color: '#ff0033', label: 'CRITICAL RISK', icon: '☠' },
};

const axisDescriptions: Record<string, string> = {
  MEV:        'Maximal extractable value exploitation risk',
  Oracle:     'Price feed manipulation & deviation risk',
  Liquidity:  'Pool depth & withdrawal pressure risk',
  Governance: 'Voting concentration & proposal risk',
  Flash:      'Flash loan attack surface risk',
  Systemic:   'Cross-protocol cascading failure risk',
};

function timeAgo(ts: number) {
  const s = Math.floor((Date.now() - ts) / 1000);
  if (s < 60) return `${s}s ago`;
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  return `${Math.floor(s / 3600)}h ago`;
}

export default function ThreatsPage() {
  const {
    threatScores,
    activeAlerts,
    overallRiskLevel,
    setThreatScores,
    resolveAlert,
    setOverallRiskLevel,
  } = useThreatStore();

  const [alertsData, setAlertsData] = useState<ThreatAlert[]>([]);

  useEffect(() => {
    if (threatScores.length === 0) setThreatScores(generateThreatScores());
    const mockAlerts = generateThreatAlerts();
    setAlertsData(mockAlerts);
    const hasCritical = mockAlerts.some((a) => a.severity === 'critical' && !a.resolved);
    const hasHigh = mockAlerts.some((a) => a.severity === 'high' && !a.resolved);
    const hasMed = mockAlerts.some((a) => a.severity === 'medium' && !a.resolved);
    setOverallRiskLevel(hasCritical ? 'critical' : hasHigh ? 'high' : hasMed ? 'medium' : 'low');
  }, []);

  const displayScores = threatScores.length > 0 ? threatScores : generateThreatScores();
  const allAlerts = activeAlerts.length > 0 ? activeAlerts : alertsData;
  const unresolvedAlerts = allAlerts.filter((a) => !a.resolved);
  const resolvedAlerts = allAlerts.filter((a) => a.resolved);
  const risk = riskConfig[overallRiskLevel] ?? riskConfig.low;

  const kpis = [
    { label: 'Active Alerts',    value: String(unresolvedAlerts.length),                                         color: unresolvedAlerts.length > 0 ? '#ff3860' : '#22c55e' },
    { label: 'Critical',         value: String(unresolvedAlerts.filter((a) => a.severity === 'critical').length), color: '#ff0033' },
    { label: 'High Severity',    value: String(unresolvedAlerts.filter((a) => a.severity === 'high').length),    color: '#ff3860' },
    { label: 'Resolved Today',   value: String(resolvedAlerts.length),                                           color: '#22c55e' },
  ];

  const handleResolve = (id: string) => {
    resolveAlert(id);
    setAlertsData((prev) => prev.map((a) => a.id === id ? { ...a, resolved: true } : a));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold font-mono text-text-primary">Threat Monitor</h1>
          <p className="text-sm text-text-tertiary font-mono mt-1">Protocol attack surface · risk vectors</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 rounded border font-mono text-sm font-bold"
          style={{ color: risk.color, borderColor: risk.color, background: `${risk.color}15` }}>
          <span>{risk.icon}</span>
          <span>{risk.label}</span>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((k) => (
          <div key={k.label} className="rounded-lg border border-[color:var(--color-border)] bg-[color:var(--color-bg-secondary)] p-4">
            <div className="text-xs font-mono text-text-tertiary mb-1">{k.label}</div>
            <div className="text-2xl font-bold font-mono" style={{ color: k.color }}>{k.value}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Threat Score Bars */}
        <div className="rounded-lg border border-[color:var(--color-border)] bg-[color:var(--color-bg-secondary)] p-5">
          <h2 className="text-sm font-mono font-bold text-text-primary mb-4">Risk Vectors</h2>
          <div className="space-y-4">
            {displayScores.map((ts) => {
              const barColor =
                ts.status === 'critical' ? '#ff0033' :
                ts.status === 'warning'  ? '#f0a500' : '#22c55e';
              return (
                <div key={ts.axis} className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-mono font-bold text-text-primary">{ts.axis}</span>
                      <span className="text-xs font-mono text-text-tertiary ml-2">{axisDescriptions[ts.axis] ?? ''}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold" style={{ color: barColor }}>{ts.score}</span>
                      <span className="text-xs font-mono px-1.5 py-0.5 rounded uppercase"
                        style={{ color: barColor, border: `1px solid ${barColor}`, background: `${barColor}1a` }}>
                        {ts.status}
                      </span>
                    </div>
                  </div>
                  <div className="h-2 bg-[color:var(--color-bg-primary)] rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{ width: `${ts.score}%`, background: barColor }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Legend */}
          <div className="mt-5 pt-4 border-t border-[color:var(--color-border)] flex items-center gap-5 text-xs font-mono text-text-tertiary">
            <span><span className="text-[#22c55e]">■</span> Safe (&lt;50)</span>
            <span><span className="text-[#f0a500]">■</span> Warning (50–70)</span>
            <span><span className="text-[#ff0033]">■</span> Critical (&gt;70)</span>
          </div>
        </div>

        {/* Active Alerts */}
        <div className="rounded-lg border border-[color:var(--color-border)] bg-[color:var(--color-bg-secondary)] p-5 flex flex-col">
          <h2 className="text-sm font-mono font-bold text-text-primary mb-4">Active Alerts</h2>
          <div className="flex-1 space-y-3 overflow-y-auto max-h-80 pr-1">
            {unresolvedAlerts.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-2xl mb-2">✓</div>
                <div className="text-xs font-mono text-[#22c55e]">No active alerts</div>
              </div>
            ) : (
              unresolvedAlerts.map((alert) => {
                const sv = severityConfig[alert.severity] ?? severityConfig.low;
                return (
                  <div key={alert.id} className="rounded border p-3 space-y-2"
                    style={{ borderColor: sv.color, background: sv.bg }}>
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-0.5 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono px-1.5 py-0.5 rounded font-bold"
                            style={{ color: sv.color, border: `1px solid ${sv.color}`, background: `${sv.color}30` }}>
                            {sv.label}
                          </span>
                          <span className="text-xs font-mono font-bold text-text-primary">{alert.type}</span>
                        </div>
                        <p className="text-xs font-mono text-text-secondary">{alert.description}</p>
                        <div className="text-xs font-mono text-text-tertiary">{timeAgo(alert.timestamp)}</div>
                      </div>
                      <button
                        onClick={() => handleResolve(alert.id)}
                        className="shrink-0 px-2 py-1 text-xs font-mono rounded border text-[#22c55e] border-[#22c55e] hover:bg-[#22c55e1a] transition-colors"
                      >
                        Resolve
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {resolvedAlerts.length > 0 && (
            <div className="mt-4 pt-3 border-t border-[color:var(--color-border)]">
              <div className="text-xs font-mono text-text-tertiary mb-2">Recently Resolved ({resolvedAlerts.length})</div>
              <div className="space-y-1">
                {resolvedAlerts.map((alert) => (
                  <div key={alert.id} className="flex items-center justify-between text-xs font-mono text-text-tertiary line-through opacity-60">
                    <span>{alert.type}</span>
                    <span>{timeAgo(alert.timestamp)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Threat Recommendations */}
      <div className="rounded-lg border border-[color:var(--color-border)] bg-[color:var(--color-bg-secondary)] p-5">
        <h2 className="text-sm font-mono font-bold text-text-primary mb-4">Recommended Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { icon: '⏸', label: 'Pause High-Risk Pools',  desc: 'Temporarily suspend pools with liquidity scores above 60', color: '#ff3860', action: 'Pause Pools' },
            { icon: '◎', label: 'Check Oracle Feeds',      desc: 'Audit price feed sources for deviation and staleness',     color: '#f0a500', action: 'Run Check' },
            { icon: '◆', label: 'Export Threat Report',    desc: 'Generate a timestamped PDF of all threat vectors',         color: '#00d4ff', action: 'Export PDF' },
          ].map((rec) => (
            <div key={rec.label} className="rounded border p-4 space-y-3"
              style={{ borderColor: rec.color, background: `${rec.color}0d` }}>
              <div className="flex items-center gap-2">
                <span style={{ color: rec.color }} className="text-lg">{rec.icon}</span>
                <span className="text-xs font-mono font-bold text-text-primary">{rec.label}</span>
              </div>
              <p className="text-xs font-mono text-text-secondary">{rec.desc}</p>
              <button className="w-full py-1.5 text-xs font-mono rounded border transition-colors hover:opacity-80"
                style={{ color: rec.color, borderColor: rec.color, background: `${rec.color}1a` }}>
                {rec.action}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
