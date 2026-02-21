import { create } from 'zustand';

export interface ThreatScore {
  axis: 'MEV' | 'Oracle' | 'Liquidity' | 'Governance' | 'Flash' | 'Systemic';
  score: number;
  status: 'safe' | 'warning' | 'critical';
}

export interface ThreatAlert {
  id: string;
  type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  timestamp: number;
  resolved: boolean;
}

interface ThreatState {
  threatScores: ThreatScore[];
  activeAlerts: ThreatAlert[];
  overallRiskLevel: 'low' | 'medium' | 'high' | 'critical';
  setThreatScores: (scores: ThreatScore[]) => void;
  updateThreatScore: (axis: string, score: number) => void;
  addAlert: (alert: Omit<ThreatAlert, 'id'>) => void;
  resolveAlert: (id: string) => void;
  setOverallRiskLevel: (level: 'low' | 'medium' | 'high' | 'critical') => void;
}

let alertCounter = 0;

export const useThreatStore = create<ThreatState>((set) => ({
  threatScores: [
    { axis: 'MEV', score: 45, status: 'safe' },
    { axis: 'Oracle', score: 30, status: 'safe' },
    { axis: 'Liquidity', score: 65, status: 'warning' },
    { axis: 'Governance', score: 25, status: 'safe' },
    { axis: 'Flash', score: 50, status: 'safe' },
    { axis: 'Systemic', score: 40, status: 'safe' },
  ],
  activeAlerts: [],
  overallRiskLevel: 'low',
  
  setThreatScores: (scores: ThreatScore[]) => set({ threatScores: scores }),
  
  updateThreatScore: (axis: string, score: number) =>
    set((state) => ({
      threatScores: state.threatScores.map((ts) =>
        ts.axis === axis
          ? {
              ...ts,
              score,
              status: score > 70 ? 'critical' : score > 50 ? 'warning' : 'safe',
            }
          : ts
      ),
    })),
  
  addAlert: (alert: Omit<ThreatAlert, 'id'>) => {
    const id = `alert-${alertCounter++}`;
    set((state) => ({
      activeAlerts: [{ ...alert, id }, ...state.activeAlerts].slice(0, 20),
    }));
  },
  
  resolveAlert: (id: string) =>
    set((state) => ({
      activeAlerts: state.activeAlerts.map((a) =>
        a.id === id ? { ...a, resolved: true } : a
      ),
    })),
  
  setOverallRiskLevel: (level: 'low' | 'medium' | 'high' | 'critical') =>
    set({ overallRiskLevel: level }),
}));
