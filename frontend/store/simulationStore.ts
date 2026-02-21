import { create } from 'zustand';

export type SimStatusType = 'idle' | 'running' | 'paused' | 'finished' | 'error';

export interface PoolSnapshot {
  reserve_a: number;
  reserve_b: number;
  price_a_per_b: number;
  total_volume: number;
  swap_count: number;
  reference_price: number;
}

export interface LendingSnapshot {
  total_collateral: number;
  total_debt: number;
  liquidatable_count: number;
  liquidation_count: number;
}

interface SimulationState {
  userId: string | null;
  status: SimStatusType;
  isRunning: boolean;
  simTime: number;
  currentStep: number;
  maxSteps: number;
  totalTrades: number;
  totalAlerts: number;
  agentsCount: number;
  activeAgents: number;
  pool: PoolSnapshot | null;
  lending: LendingSnapshot | null;
  crashed: boolean;
  cascadeTriggered: boolean;
  setUserId: (userId: string | null) => void;
  setStatus: (status: SimStatusType) => void;
  setRunning: (running: boolean) => void;
  setSimTime: (time: number) => void;
  setCurrentStep: (step: number) => void;
  setMaxSteps: (steps: number) => void;
  incrementTime: () => void;
  incrementStep: () => void;
  setTotalTrades: (n: number) => void;
  setTotalAlerts: (n: number) => void;
  setAgentsCount: (n: number) => void;
  setActiveAgents: (n: number) => void;
  setPool: (pool: PoolSnapshot) => void;
  setLending: (lending: LendingSnapshot) => void;
  setCrashed: (crashed: boolean) => void;
  setCascadeTriggered: (triggered: boolean) => void;
  resetSimulation: () => void;
  syncFromBackend: (data: any) => void;
}

export const useSimulationStore = create<SimulationState>((set) => ({
  userId: null,
  status: 'idle',
  isRunning: false,
  simTime: 0,
  currentStep: 0,
  maxSteps: 0,
  totalTrades: 0,
  totalAlerts: 0,
  agentsCount: 0,
  activeAgents: 0,
  pool: null,
  lending: null,
  crashed: false,
  cascadeTriggered: false,
  
  setUserId: (userId: string | null) => set({ userId }),
  
  setStatus: (status: SimStatusType) =>
    set({ status, isRunning: status === 'running' }),
  
  setRunning: (running: boolean) =>
    set({ isRunning: running, status: running ? 'running' : 'idle' }),
  
  setSimTime: (time: number) => set({ simTime: time }),
  setCurrentStep: (step: number) => set({ currentStep: step }),
  setMaxSteps: (steps: number) => set({ maxSteps: steps }),
  
  incrementTime: () => set((state) => ({ simTime: state.simTime + 2 })),
  incrementStep: () => set((state) => ({ currentStep: state.currentStep + 1 })),
  
  setTotalTrades: (n: number) => set({ totalTrades: n }),
  setTotalAlerts: (n: number) => set({ totalAlerts: n }),
  setAgentsCount: (n: number) => set({ agentsCount: n }),
  setActiveAgents: (n: number) => set({ activeAgents: n }),
  setPool: (pool: PoolSnapshot) => set({ pool }),
  setLending: (lending: LendingSnapshot) => set({ lending }),
  
  setCrashed: (crashed: boolean) => set({ crashed }),
  setCascadeTriggered: (triggered: boolean) => set({ cascadeTriggered: triggered }),
  
  resetSimulation: () => set((state) => ({
    status: 'idle',
    isRunning: false,
    simTime: 0,
    currentStep: 0,
    maxSteps: 0,
    totalTrades: 0,
    totalAlerts: 0,
    agentsCount: 0,
    activeAgents: 0,
    pool: null,
    lending: null,
    crashed: false,
    cascadeTriggered: false,
    userId: state.userId,
  })),
  
  /** Sync full status blob from backend /api/simulation/status */
  syncFromBackend: (data: any) => set({
    status: data.status ?? 'idle',
    isRunning: data.status === 'running',
    currentStep: data.current_step ?? 0,
    maxSteps: data.max_steps ?? 0,
    simTime: data.elapsed_seconds ?? 0,
    totalTrades: data.total_trades ?? 0,
    totalAlerts: data.total_alerts ?? 0,
    agentsCount: data.agents_count ?? 0,
    activeAgents: data.active_agents ?? 0,
    pool: data.pool ?? null,
    lending: data.lending ?? null,
  }),
}));
