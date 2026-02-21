import { create } from 'zustand';

export interface CreditScore {
  wallet: string;
  score: number;
  tier: 'bronze' | 'silver' | 'gold' | 'platinum';
  type: 'borrower' | 'lender' | 'trader';
  delta: number;
  lastUpdated: number;
}

export interface ScoreFactor {
  name: string;
  weight: number;
  contribution: number;
  impact: number;
}

interface CreditState {
  leaderboard: CreditScore[];
  selectedWallet: string | null;
  scoreHistory: Array<{ timestamp: number; score: number }>;
  factors: ScoreFactor[];
  dynamicRates: Array<{ tier: string; ltv: number; borrowRate: number; liquidationBuffer: number }>;
  setLeaderboard: (scores: CreditScore[]) => void;
  setSelectedWallet: (wallet: string | null) => void;
  updateScoreHistory: (history: Array<{ timestamp: number; score: number }>) => void;
  setFactors: (factors: ScoreFactor[]) => void;
  setDynamicRates: (rates: Array<{ tier: string; ltv: number; borrowRate: number; liquidationBuffer: number }>) => void;
}

export const useCreditStore = create<CreditState>((set) => ({
  leaderboard: [],
  selectedWallet: null,
  scoreHistory: [],
  factors: [],
  dynamicRates: [],
  
  setLeaderboard: (scores: CreditScore[]) => set({ leaderboard: scores }),
  
  setSelectedWallet: (wallet: string | null) => set({ selectedWallet: wallet }),
  
  updateScoreHistory: (history: Array<{ timestamp: number; score: number }>) =>
    set({ scoreHistory: history }),
  
  setFactors: (factors: ScoreFactor[]) => set({ factors }),
  
  setDynamicRates: (rates: Array<{ tier: string; ltv: number; borrowRate: number; liquidationBuffer: number }>) =>
    set({ dynamicRates: rates }),
}));
