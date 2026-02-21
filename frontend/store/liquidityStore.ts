import { create } from 'zustand';

export interface PoolData {
  token0: string;
  token1: string;
  reserve0: number;
  reserve1: number;
  fee: number;
  tvl: number;
}

export interface SlippagePoint {
  tradeSize: number;
  slippage: number;
}

interface LiquidityState {
  pool: PoolData;
  depthChartData: Array<{ price: number; asks: number; bids: number }>;
  slippageCurve: SlippagePoint[];
  imperialLoss: number;
  eventLog: Array<{ timestamp: number; event: string; type: string }>;
  setPool: (pool: PoolData) => void;
  setDepthChartData: (data: Array<{ price: number; asks: number; bids: number }>) => void;
  setSlippageCurve: (curve: SlippagePoint[]) => void;
  setImperialLoss: (loss: number) => void;
  addEventLog: (event: { timestamp: number; event: string; type: string }) => void;
}

export const useLiquidityStore = create<LiquidityState>((set) => ({
  pool: {
    token0: 'USDC',
    token1: 'ETH',
    reserve0: 1000000,
    reserve1: 500,
    fee: 0.3,
    tvl: 1500000,
  },
  depthChartData: [],
  slippageCurve: [],
  imperialLoss: 0,
  eventLog: [],
  
  setPool: (pool: PoolData) => set({ pool }),
  
  setDepthChartData: (data: Array<{ price: number; asks: number; bids: number }>) =>
    set({ depthChartData: data }),
  
  setSlippageCurve: (curve: SlippagePoint[]) => set({ slippageCurve: curve }),
  
  setImperialLoss: (loss: number) => set({ imperialLoss: loss }),
  
  addEventLog: (event: { timestamp: number; event: string; type: string }) =>
    set((state) => ({
      eventLog: [event, ...state.eventLog].slice(0, 20),
    })),
}));
