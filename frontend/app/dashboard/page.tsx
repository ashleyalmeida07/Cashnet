'use client';

import React, { useEffect, useState } from 'react';
import KPICard from '@/components/KPICard';
import Terminal from '@/components/Terminal';
import DataTable from '@/components/DataTable';
import Badge from '@/components/Badge';
import { useSimulationStore } from '@/store/simulationStore';
import { useUIStore } from '@/store/uiStore';
import { generateAgents, generateActivityFeed } from '@/lib/mockData';

interface DashboardKPI {
  label: string;
  value: number;
  unit: string;
  color: 'accent' | 'danger' | 'warn' | 'success';
}

export default function DashboardPage() {
  const isRunning = useSimulationStore((state) => state.isRunning);
  const simTime = useSimulationStore((state) => state.simTime);
  const crashed = useSimulationStore((state) => state.crashed);
  const setCascadeTriggered = useSimulationStore((state) => state.setCascadeTriggered);
  const addToast = useUIStore((state) => state.addToast);

  const [kpis, setKpis] = useState<DashboardKPI[]>([
    { label: 'Total Value Locked', value: 125000000, unit: '$', color: 'accent' },
    { label: 'Stress Level', value: 42, unit: '%', color: 'warn' },
    { label: 'Liquidation Risk', value: 3.2, unit: '%', color: 'danger' },
    { label: 'Active Agents', value: 5, unit: '', color: 'success' },
  ]);

  const [terminalLines, setTerminalLines] = useState([
    { text: 'System initialized', type: 'success' as const, timestamp: Date.now() },
    { text: 'Waiting for simulation start...', type: 'info' as const, timestamp: Date.now() },
  ]);

  const agents = generateAgents();
  const activityFeed = generateActivityFeed();

  // Simulation loop
  useEffect(() => {
    if (!isRunning) return;

    const interval = setInterval(() => {
      setKpis((prev) =>
        prev.map((kpi) => ({
          ...kpi,
          value: kpi.value * (1 + (Math.random() - 0.5) * 0.02),
        }))
      );

      const agentActions = [
        { text: `Agent ${Math.floor(Math.random() * 6)} executed trade`, type: 'success' as const },
        { text: `Price update: ETH/USD $${(Math.random() * 4000 + 2000).toFixed(2)}`, type: 'info' as const },
        { text: `Pool rebalance triggered`, type: 'info' as const },
      ];

      const randomAction = agentActions[Math.floor(Math.random() * agentActions.length)];
      setTerminalLines((prev) => [
        ...prev.slice(-19),
        { ...randomAction, timestamp: Date.now() },
      ]);
    }, 2000);

    return () => clearInterval(interval);
  }, [isRunning]);

  const handleCrashTest = () => {
    setCascadeTriggered(true);
    addToast({
      message: 'Cascade event triggered! 🚨',
      severity: 'error',
    });
    setKpis((prev) =>
      prev.map((kpi) =>
        kpi.label === 'Liquidation Risk'
          ? { ...kpi, value: 85 }
          : kpi
      )
    );
  };

  return (
    <div className="space-y-8 animate-fadeUp">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-mono text-text-primary">
            Dashboard Overview
          </h1>
          <p className="text-text-secondary text-sm mt-1">
            {crashed
              ? 'System crashed - Critical status'
              : isRunning
              ? 'Simulation running - Real-time monitoring'
              : 'Idle - Ready to start'}
          </p>
        </div>
        <button
          onClick={handleCrashTest}
          className="btn danger"
        >
          CRASH TEST
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi, idx) => (
          <KPICard
            key={idx}
            label={kpi.label}
            value={kpi.value}
            unit={kpi.unit}
            color={kpi.color}
            animateValue={isRunning}
          />
        ))}
      </div>

      {/* Protocol Health Matrix */}
      <div className="card">
        <h2 className="text-lg font-mono font-bold text-text-primary mb-4">
          Protocol Health Matrix
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { name: 'AMM', health: 85 },
            { name: 'Lending', health: 72 },
            { name: 'Oracle', health: 98 },
            { name: 'Stablecoin', health: 64 },
          ].map((item) => (
            <div key={item.name} className="flex flex-col">
              <span className="text-xs font-mono text-text-tertiary uppercase mb-2">
                {item.name}
              </span>
              <div className="flex items-center gap-2">
                <div className="flex-1 h-2 bg-[color:var(--color-bg-accent)] rounded overflow-hidden">
                  <div
                    className={`h-full transition-all ${
                      item.health > 80
                        ? 'bg-success'
                        : item.health > 50
                        ? 'bg-warn'
                        : 'bg-danger'
                    }`}
                    style={{ width: `${item.health}%` }}
                  />
                </div>
                <span className="text-sm font-mono font-bold min-w-fit">
                  {item.health}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Event Feed */}
        <div className="lg:col-span-2">
          <Terminal
            title="Event Feed"
            lines={terminalLines}
            maxLines={12}
          />
        </div>

        {/* Active Agents */}
        <div className="card">
          <h3 className="text-sm font-mono font-bold text-text-primary uppercase mb-4">
            Active Agents
          </h3>
          <div className="space-y-2">
            {agents
              .filter((a) => a.active)
              .map((agent) => (
                <div
                  key={agent.id}
                  className="flex items-center justify-between p-3 bg-[color:var(--color-bg-accent)] rounded"
                >
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-mono font-bold text-text-primary truncate">
                      {agent.name}
                    </div>
                    <div className="text-xs text-text-tertiary font-mono">
                      {agent.type}
                    </div>
                  </div>
                  <Badge variant={agent.risk === 'high' ? 'danger' : agent.risk === 'medium' ? 'warn' : 'success'}>
                    {agent.risk.toUpperCase()}
                  </Badge>
                </div>
              ))}
          </div>
        </div>
      </div>

      {/* Agent Performance Table */}
      <div className="card">
        <h3 className="text-lg font-mono font-bold text-text-primary mb-4">
          Agent Performance
        </h3>
        <DataTable
          columns={[
            { header: 'Agent', accessor: 'name' },
            { header: 'Type', accessor: 'type' },
            { header: 'Capital', accessor: (row) => `$${(row.capital / 1000).toFixed(0)}k` },
            { header: 'PnL', accessor: (row) => (
              <span className={row.pnl >= 0 ? 'text-success' : 'text-danger'}>
                {row.pnl >= 0 ? '+' : ''}{row.pnl}
              </span>
            ) },
            { header: 'Win Rate', accessor: (row) => `${(row.winRate * 100).toFixed(0)}%` },
          ]}
          data={agents}
        />
      </div>
    </div>
  );
}
