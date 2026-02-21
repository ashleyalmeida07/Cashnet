import { create } from 'zustand';

export type AgentType =
  | 'retail_trader'
  | 'whale'
  | 'arbitrage_bot'
  | 'liquidator_bot'
  | 'mev_bot'
  | 'attacker';

export interface AgentStats {
  trades_count: number;
  total_volume: number;
  pnl: number;
  win_rate: number;
  alerts_triggered: number;
}

export interface Agent {
  id: string;
  name: string;
  type: AgentType;
  capital: number;
  current_value: number;
  pnl: number;
  win_rate: number;
  active: boolean;
  state: string;
  risk: 'low' | 'medium' | 'high';
  speed: 'slow' | 'normal' | 'fast';
  stats: AgentStats;
}

export interface ActivityFeedItem {
  timestamp: number;
  agent_id: string;
  agent_name: string;
  agent_type: string;
  event_type: string;
  data: Record<string, any>;
}

interface AgentState {
  agents: Agent[];
  activityFeed: ActivityFeedItem[];
  totalCapital: number;
  setAgents: (agents: Agent[]) => void;
  updateAgent: (id: string, updates: Partial<Agent>) => void;
  addActivityFeedItem: (item: ActivityFeedItem) => void;
  setActivityFeed: (feed: ActivityFeedItem[]) => void;
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
    activityFeed: [item, ...state.activityFeed].slice(0, 50),
  })),
  
  setActivityFeed: (feed: ActivityFeedItem[]) => set({ activityFeed: feed }),
  
  setTotalCapital: (capital: number) => set({ totalCapital: capital }),
}));
