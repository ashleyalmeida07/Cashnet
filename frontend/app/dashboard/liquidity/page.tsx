'use client';

import React, { useState } from 'react';
import Terminal from '@/components/Terminal';
import Badge from '@/components/Badge';
import KPICard from '@/components/KPICard';
import { useLiquidityStore } from '@/store/liquidityStore';
import { useSimulationStore } from '@/store/simulationStore';
import { useUIStore } from '@/store/uiStore';

interface PoolMetric {
  label: string;
  value: number | string;
  unit: string;
}

export default function LiquidityPage() {
  const pool = useLiquidityStore((state) => state.pool);
  const addEventLog = useLiquidityStore((state) => state.addEventLog);
  const eventLog = useLiquidityStore((state) => state.eventLog);
  const isRunning = useSimulationStore((state) => state.isRunning);
  const setCascadeTriggered = useSimulationStore((state) => state.setCascadeTriggered);
  const addToast = useUIStore((state) => state.addToast);

  const [configOpen, setConfigOpen] = useState(false);
  const [config, setConfig] = useState({
    protocolType: 'uniswap-v3',
    tokenPair: 'USDC/ETH',
    initialLiquidity: 1000000,
    stressScenario: 'none',
  });

  const [poolMetrics] = useState<PoolMetric[]>([
    { label: 'Total Value Locked', value: '$1.5M', unit: '' },
    { label: 'Fee Tier', value: '0.3%', unit: '' },
    { label: '24h Volume', value: '$2.3M', unit: '' },
    { label: 'K Product', value: '500M', unit: '' },
  ]);

  // Simulated depth chart data
  const depthChartData = [
    { price: 2900, asks: 50, bids: 120 },
    { price: 3000, asks: 80, bids: 100 },
    { price: 3100, asks: 120, bids: 80 },
    { price: 3200, asks: 150, bids: 60 },
    { price: 3300, asks: 200, bids: 40 },
  ];

  const handleStressTest = (scenario: string) => {
    setCascadeTriggered(true);
    addEventLog({
      timestamp: Date.now(),
      event: `Stress test triggered: ${scenario}`,
      type: 'stress',
    });
    addToast({
      message: `${scenario} stress test initiated`,
      severity: 'warning',
    });
  };

  const terminalLines = [
    ...eventLog.map((e) => ({
      text: e.event,
      type: (e.type === 'stress' ? 'warn' : 'info') as const,
      timestamp: e.timestamp,
    })),
    {
      text: 'Liquidity pool monitoring active',
      type: 'success' as const,
      timestamp: Date.now(),
    },
  ];

  return (
    <div className="space-y-8 animate-fadeUp">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-mono text-text-primary mb-2">
            Liquidity Engine
          </h1>
          <p className="text-text-secondary text-sm font-mono">
            AMM mechanics, slippage curves, and depth analysis
          </p>
        </div>
        <button
          onClick={() => setConfigOpen(!configOpen)}
          className="btn ghost text-sm"
        >
          {configOpen ? '▼' : '▶'} CONFIG
        </button>
      </div>

      {/* Configuration Panel */}
      {configOpen && (
        <div className="card space-y-4 border-accent/50">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <label className="form-label text-xs">Protocol Type</label>
              <select
                value={config.protocolType}
                onChange={(e) =>
                  setConfig({ ...config, protocolType: e.target.value })
                }
                className="form-input text-xs"
              >
                <option>uniswap-v3</option>
                <option>curve</option>
                <option>balancer</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="form-label text-xs">Token Pair</label>
              <select
                value={config.tokenPair}
                onChange={(e) =>
                  setConfig({ ...config, tokenPair: e.target.value })
                }
                className="form-input text-xs"
              >
                <option>USDC/ETH</option>
                <option>DAI/USDC</option>
                <option>WETH/USDC</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="form-label text-xs">Initial Liquidity</label>
              <input
                type="number"
                value={config.initialLiquidity}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    initialLiquidity: parseInt(e.target.value),
                  })
                }
                className="form-input text-xs"
              />
            </div>

            <div className="space-y-2">
              <label className="form-label text-xs">Stress Scenario</label>
              <select
                value={config.stressScenario}
                onChange={(e) =>
                  setConfig({ ...config, stressScenario: e.target.value })
                }
                className="form-input text-xs"
              >
                <option value="none">None</option>
                <option value="flash-swap">Flash Swap</option>
                <option value="slippage">High Slippage</option>
                <option value="depletion">Liquidity Depletion</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Charts & Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Depth Chart */}
        <div className="lg:col-span-1 card">
          <h3 className="text-sm font-mono font-bold text-text-primary uppercase mb-4">
            Order Book Depth
          </h3>
          <div className="space-y-2">
            {depthChartData.map((point, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-text-secondary font-mono">${point.price}</span>
                  <span className="text-text-tertiary text-xs">
                    Bid/Ask: {point.bids}/${point.asks}
                  </span>
                </div>
                <div className="flex gap-2">
                  <div className="flex-1 h-2 bg-[rgba(0,212,99,0.3)] rounded">
                    <div
                      className="h-full bg-success"
                      style={{ width: `${(point.bids / 120) * 100}%` }}
                    />
                  </div>
                  <div className="flex-1 h-2 bg-[rgba(255,56,96,0.3)] rounded">
                    <div
                      className="h-full bg-danger"
                      style={{ width: `${(point.asks / 200) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Slippage Curve */}
        <div className="lg:col-span-1 card">
          <h3 className="text-sm font-mono font-bold text-text-primary uppercase mb-4">
            Slippage Curve
          </h3>
          <div className="space-y-3">
            {[
              { size: '$10k', slippage: 0.05 },
              { size: '$50k', slippage: 0.18 },
              { size: '$100k', slippage: 0.42 },
              { size: '$500k', slippage: 2.1 },
              { size: '$1M', slippage: 5.3 },
            ].map((item) => (
              <div key={item.size} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-text-secondary font-mono">{item.size}</span>
                  <span className="text-accent font-mono font-bold">
                    {item.slippage.toFixed(2)}%
                  </span>
                </div>
                <div className="h-2 bg-[color:var(--color-bg-accent)] rounded overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-success to-danger"
                    style={{ width: `${Math.min((item.slippage / 5) * 100, 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Pool Metrics */}
        <div className="lg:col-span-1 space-y-4">
          {poolMetrics.map((metric, idx) => (
            <div key={idx} className="card">
              <div className="text-xs font-mono text-text-tertiary uppercase mb-2">
                {metric.label}
              </div>
              <div className="text-lg font-bold font-mono text-accent">
                {metric.value}
                {metric.unit && <span className="text-sm text-text-secondary"> {metric.unit}</span>}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Pool Reserves */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card space-y-4">
          <h3 className="text-sm font-mono font-bold text-text-primary uppercase">
            Pool Reserves
          </h3>
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-text-secondary font-mono">USDC</span>
                <span className="text-sm font-mono font-bold text-accent">
                  ${(pool.reserve0 / 1000000).toFixed(2)}M
                </span>
              </div>
              <div className="h-3 bg-[color:var(--color-bg-accent)] rounded overflow-hidden">
                <div
                  className="h-full bg-accent"
                  style={{
                    width: `${(pool.reserve0 / (pool.reserve0 + pool.reserve1 * 3200)) * 100}%`,
                  }}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-text-secondary font-mono">ETH</span>
                <span className="text-sm font-mono font-bold text-cyan">
                  {pool.reserve1.toFixed(2)} ETH
                </span>
              </div>
              <div className="h-3 bg-[color:var(--color-bg-accent)] rounded overflow-hidden">
                <div
                  className="h-full bg-cyan"
                  style={{
                    width: `${(pool.reserve1 * 3200 / (pool.reserve0 + pool.reserve1 * 3200)) * 100}%`,
                  }}
                />
              </div>
            </div>

            <div className="pt-4 border-t border-[color:var(--color-border)]">
              <div className="text-xs text-text-tertiary font-mono mb-1">K PRODUCT</div>
              <div className="text-lg font-bold font-mono text-text-primary">
                {(pool.reserve0 * pool.reserve1 / 1000000).toFixed(0)}M
              </div>
            </div>
          </div>
        </div>

        {/* Event Log */}
        <Terminal title="Pool Event Log" lines={terminalLines} maxLines={10} />
      </div>

      {/* Stress Test Buttons */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <button
          onClick={() => handleStressTest('Flash Swap')}
          className="btn warn text-xs py-3 font-mono"
          disabled={!isRunning}
        >
          FLASH SWAP
        </button>
        <button
          onClick={() => handleStressTest('High Slippage')}
          className="btn warn text-xs py-3 font-mono"
          disabled={!isRunning}
        >
          SLIPPAGE TEST
        </button>
        <button
          onClick={() => handleStressTest('Liquidity Drain')}
          className="btn danger text-xs py-3 font-mono"
          disabled={!isRunning}
        >
          DRAIN TEST
        </button>
        <button
          onClick={() => handleStressTest('Impermanent Loss')}
          className="btn danger text-xs py-3 font-mono"
          disabled={!isRunning}
        >
          IL TEST
        </button>
      </div>
    </div>
  );
}
