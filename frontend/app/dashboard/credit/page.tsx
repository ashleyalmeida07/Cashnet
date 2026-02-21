'use client';

import React, { useState } from 'react';
import DataTable from '@/components/DataTable';
import Badge from '@/components/Badge';
import { generateCreditScores, generateScoreFactors, generateDynamicRates } from '@/lib/mockData';

export default function CreditPage() {
  const [leaderboard] = useState(() => generateCreditScores());
  const [factors] = useState(() => generateScoreFactors());
  const [rates] = useState(() => generateDynamicRates());
  const [selectedWallet, setSelectedWallet] = useState(leaderboard[0]?.wallet);

  const selectedScore = leaderboard.find((s) => s.wallet === selectedWallet);

  return (
    <div className="space-y-8 animate-fadeUp">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold font-mono text-text-primary mb-2">
          Credit Scoring Engine
        </h1>
        <p className="text-text-secondary text-sm font-mono">
          Dynamic rates, leaderboard rankings, and score composition
        </p>
      </div>

      {/* Leaderboard */}
      <div className="card space-y-4">
        <h3 className="text-sm font-mono font-bold text-text-primary uppercase">Credit Score Leaderboard</h3>
        <div className="overflow-x-auto">
          <table className="data-table w-full">
            <thead>
              <tr>
                <th>Rank</th>
                <th>Wallet</th>
                <th>Score</th>
                <th>Tier</th>
                <th>Type</th>
                <th>Delta</th>
              </tr>
            </thead>
            <tbody>
              {leaderboard.map((score, idx) => (
                <tr
                  key={score.wallet}
                  onClick={() => setSelectedWallet(score.wallet)}
                  className="cursor-pointer hover:bg-[color:var(--color-bg-accent)]/50"
                >
                  <td className="font-mono text-xs font-bold">{idx + 1}</td>
                  <td className="font-mono text-xs truncate">{score.wallet.slice(0, 12)}...</td>
                  <td className="font-mono text-xs font-bold text-accent">{score.score}</td>
                  <td>
                    <Badge variant={score.tier === 'platinum' ? 'purple' : score.tier === 'gold' ? 'warn' : 'medium'}>
                      {score.tier.toUpperCase()}
                    </Badge>
                  </td>
                  <td className="font-mono text-xs capitalize">{score.type}</td>
                  <td className={`font-mono text-xs font-bold ${score.delta >= 0 ? 'text-success' : 'text-danger'}`}>
                    {score.delta >= 0 ? '+' : ''}{score.delta}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Selected Wallet Details */}
      {selectedScore && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Score Radar */}
          <div className="card p-6">
            <h4 className="text-sm font-mono font-bold text-text-primary uppercase mb-4">
              Score Composition
            </h4>
            <div className="space-y-3">
              {factors.map((factor) => (
                <div key={factor.name}>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-mono text-text-secondary">{factor.name}</span>
                    <span className="font-mono font-bold text-accent">{factor.contribution}</span>
                  </div>
                  <div className="h-2 bg-[color:var(--color-bg-accent)] rounded overflow-hidden">
                    <div
                      className="h-full bg-accent"
                      style={{ width: `${(factor.contribution / 312) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Score History */}
          <div className="card p-6">
            <h4 className="text-sm font-mono font-bold text-text-primary uppercase mb-4">
              30-Day History
            </h4>
            <div className="h-32 bg-[color:var(--color-bg-accent)] rounded flex items-end gap-0.5">
              {[...Array(30)].map((_, idx) => (
                <div
                  key={idx}
                  className="flex-1 bg-accent opacity-60 rounded-t"
                  style={{
                    height: `${40 + Math.sin(idx / 5) * 30}%`,
                  }}
                />
              ))}
            </div>
          </div>

          {/* Factor Breakdown */}
          <div className="card p-6">
            <h4 className="text-sm font-mono font-bold text-text-primary uppercase mb-4">
              Factor Impact
            </h4>
            <div className="space-y-2">
              {factors.slice(0, 3).map((factor) => (
                <div
                  key={factor.name}
                  className="p-2 bg-[color:var(--color-bg-accent)] rounded text-xs"
                >
                  <div className="font-mono font-bold text-text-primary">{factor.name}</div>
                  <div className="text-text-tertiary font-mono">
                    +{factor.contribution} impact
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Dynamic Rate Table */}
      <div className="card space-y-4">
        <h3 className="text-sm font-mono font-bold text-text-primary uppercase">Dynamic Rate Tiers</h3>
        <DataTable
          columns={[
            { header: 'Tier', accessor: 'tier', className: 'font-mono font-bold text-xs' },
            { header: 'LTV', accessor: (row) => `${row.ltv * 100}%`, className: 'font-mono text-xs' },
            { header: 'Borrow Rate', accessor: (row) => `${row.borrowRate}%`, className: 'font-mono text-xs' },
            { header: 'Liquidation Buffer', accessor: (row) => `${row.liquidationBuffer}x`, className: 'font-mono text-xs' },
          ]}
          data={rates.map((r, idx) => ({ ...r, tier: r.tier, id: `tier-${idx}` }))}
        />
      </div>
    </div>
  );
}
