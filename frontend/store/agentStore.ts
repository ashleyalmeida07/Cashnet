import { create } from 'zustand';

export interface Agent {
  id: string;
  name: string;
  type: 'arbitrage' | 'liquidator' | 'maker' | 'trader' | 'oracle' | 'governance';
  capital: number;
  currentValue: number;
  pnl: number;
  winRate: number;
  active: boolean;
  risk: 'low' | 'medium' | 'high';
  speed: 'slow' | 'normal' | 'fast';
  strategy: string;
}

export interface ActivityFeedItem {
  timestamp: number;
  agentId: string;
  action: string;
  status: 'success' | 'error' | 'pending';
  details: string;
}

interface AgentState {
  agents: Agent[];
  activityFeed: ActivityFeedItem[];
  totalCapital: number;
  setAgents: (agents: Agent[]) => void;
  updateAgent: (id: string, updates: Partial<Agent>) => void;
  addActivityFeedItem: (item: ActivityFeedItem) => void;
  setTotalCapital: (capital: number) => void;
}

export const useAgentStore = create<AgentState>((set) => ({
  agents: [],
  activityFeed: [],
  totalCapital: 0,
  
  setAgents: (agents: Agent[]) => set({ agents }),
  
  updateAgent: (id: string, updates: Partial<Agent>) => set((state) => ({
    agents: state.agents.map((agent) =>
      agent.id === id ? { ...agent, ...updates } : agent
    ),
  })),
  
  addActivityFeedItem: (item: ActivityFeedItem) => set((state) => ({
    activityFeed: [item, ...state.activityFeed].slice(0, 20),
  })),
  
  setTotalCapital: (capital: number) => set({ totalCapital: capital }),
}));
