'use client';

import React, { useState } from 'react';
import Terminal from '@/components/Terminal';
import DataTable from '@/components/DataTable';
import Badge from '@/components/Badge';
import { useAgentStore } from '@/store/agentStore';
import { generateAgents, generateActivityFeed } from '@/lib/mockData';

export default function AgentsPage() {
  const agents = useState(() => generateAgents())[0];
  const activityFeed = useState(() => generateActivityFeed())[0];

  const terminalLines = activityFeed.map((item) => ({
    text: `[${item.agentId}] ${item.action}: ${item.details}`,
    type: item.status as any,
    timestamp: item.timestamp,
  }));

  const totalCapital = agents.reduce((sum, a) => sum + a.capital, 0);
  const totalValue = agents.reduce((sum, a) => sum + a.currentValue, 0);
  const totalPnL = agents.reduce((sum, a) => sum + a.pnl, 0);

  return (
    <div className="space-y-8 animate-fadeUp">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold font-mono text-text-primary mb-2">
          Agent Simulator
        </h1>
        <p className="text-text-secondary text-sm font-mono">
          Multi-agent strategies, performance tracking, and MEV analysis
        </p>
      </div>

      {/* Agent Controls */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        {agents.map((agent) => (
          <div key={agent.id} className="card p-4 space-y-3">
            <div>
              <h3 className="font-bold font-mono text-text-primary text-sm">{agent.name}</h3>
              <p className="text-xs text-text-tertiary font-mono mt-1">{agent.type}</p>
            </div>
            <div className="space-y-2">
              <div className="text-xs">
                <label className="form-label text-xs">Capital Slider</label>
                <input
                  type="range"
                  min="50000"
                  max="500000"
                  defaultValue={agent.capital}
                  className="w-full"
                />
              </div>
              <Badge variant={agent.risk === 'high' ? 'critical' : agent.risk === 'medium' ? 'high' : 'success'}>
                {agent.risk.toUpperCase()}
              </Badge>
            </div>
            <label className="flex items-center gap-2 text-xs cursor-pointer">
              <input type="checkbox" defaultChecked={agent.active} />
              <span className="font-mono">Active</span>
            </label>
          </div>
        ))}
      </div>

      {/* Playback Controls */}
      <div className="card flex items-center justify-between p-4">
        <div className="flex items-center gap-4">
          <button className="btn accent text-xs py-2 px-4">▶ START</button>
          <button className="btn ghost text-xs py-2 px-4">⏸ PAUSE</button>
          <button className="btn ghost text-xs py-2 px-4">⏹ STOP</button>
        </div>
        <div className="flex items-center gap-4 font-mono text-sm">
          <span className="text-text-secondary">Total Capital: <span className="text-accent font-bold">${(totalCapital / 1000000).toFixed(2)}M</span></span>
          <span className="text-text-secondary">Agents: <span className="text-accent font-bold">{agents.filter(a => a.active).length}</span></span>
        </div>
      </div>

      {/* Activity Feed & Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Terminal title="Agent Activity Feed" lines={terminalLines} maxLines={12} />
        </div>

        <div className="card space-y-4">
          <h3 className="text-sm font-mono font-bold text-text-primary uppercase">PnL Summary</h3>
          <div className="space-y-3">
            <div className="p-3 bg-[color:var(--color-bg-accent)] rounded">
              <div className="text-xs text-text-tertiary font-mono">Total Capital</div>
              <div className="text-xl font-bold font-mono text-accent">${(totalCapital / 1000000).toFixed(2)}M</div>
            </div>
            <div className="p-3 bg-[color:var(--color-bg-accent)] rounded">
              <div className="text-xs text-text-tertiary font-mono">Current Value</div>
              <div className="text-xl font-bold font-mono text-cyan">${(totalValue / 1000000).toFixed(2)}M</div>
            </div>
            <div className={`p-3 rounded ${totalPnL >= 0 ? 'bg-[rgba(0,212,99,0.1)]' : 'bg-[rgba(255,56,96,0.1)]'}`}>
              <div className="text-xs text-text-tertiary font-mono">Total PnL</div>
              <div className={`text-xl font-bold font-mono ${totalPnL >= 0 ? 'text-success' : 'text-danger'}`}>
                {totalPnL >= 0 ? '+' : ''}{totalPnL}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Performance Table */}
      <div className="card space-y-4">
        <h3 className="text-sm font-mono font-bold text-text-primary uppercase">Agent Performance</h3>
        <DataTable
          columns={[
            { header: 'Agent', accessor: 'name', className: 'font-mono text-xs font-bold' },
            { header: 'Type', accessor: 'type', className: 'font-mono text-xs' },
            { header: 'Capital', accessor: (row) => `$${(row.capital / 1000).toFixed(0)}k`, className: 'text-xs' },
            { header: 'Current Value', accessor: (row) => `$${(row.currentValue / 1000).toFixed(0)}k`, className: 'text-xs' },
            {
              header: 'PnL',
              accessor: (row) => (
                <span className={row.pnl >= 0 ? 'text-success' : 'text-danger'}>
                  {row.pnl >= 0 ? '+' : ''}{row.pnl}
                </span>
              ),
              className: 'font-mono text-xs font-bold',
            },
            { header: 'Win Rate', accessor: (row) => `${(row.winRate * 100).toFixed(0)}%`, className: 'text-xs' },
            {
              header: 'Status',
              accessor: (row) => (
                <Badge variant={row.active ? 'success' : 'medium'}>
                  {row.active ? 'ACTIVE' : 'IDLE'}
                </Badge>
              ),
            },
          ]}
          data={agents}
        />
      </div>

      {/* MEV Visualizer */}
      <div className="card space-y-4">
        <h3 className="text-sm font-mono font-bold text-text-primary uppercase">MEV Front-run Visualizer</h3>
        <div className="space-y-3">
          {[
            { step: 1, label: 'User Intent', actor: 'User', color: 'accent' },
            { step: 2, label: 'Mempool Detection', actor: 'MEV Bot', color: 'warn' },
            { step: 3, label: 'Front-Run Tx', actor: 'Bot', color: 'danger' },
            { step: 4, label: 'User Tx Included', actor: 'User', color: 'warn' },
            { step: 5, label: 'Back-Run Tx', actor: 'Bot', color: 'danger' },
          ].map((item) => (
            <div key={item.step} className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold font-mono bg-[#${item.color}] text-xs`}>
                {item.step}
              </div>
              <div className="flex-1">
                <div className="font-mono text-sm text-text-primary">{item.label}</div>
                <div className="text-xs text-text-tertiary font-mono">{item.actor}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
