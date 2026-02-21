import { create } from 'zustand';

interface SimulationState {
  userId: string | null;
  isRunning: boolean;
  simTime: number;
  currentStep: number;
  crashed: boolean;
  cascadeTriggered: boolean;
  setUserId: (userId: string | null) => void;
  setRunning: (running: boolean) => void;
  incrementTime: () => void;
  incrementStep: () => void;
  setCrashed: (crashed: boolean) => void;
  setCascadeTriggered: (triggered: boolean) => void;
  resetSimulation: () => void;
}

export const useSimulationStore = create<SimulationState>((set) => ({
  userId: null,
  isRunning: false,
  simTime: 0,
  currentStep: 0,
  crashed: false,
  cascadeTriggered: false,
  
  setUserId: (userId: string | null) => set({ userId }),
  
  setRunning: (running: boolean) => set({ isRunning: running }),
  
  incrementTime: () => set((state) => ({ simTime: state.simTime + 2 })),
  
  incrementStep: () => set((state) => ({ currentStep: state.currentStep + 1 })),
  
  setCrashed: (crashed: boolean) => set({ crashed }),
  
  setCascadeTriggered: (triggered: boolean) => set({ cascadeTriggered: triggered }),
  
  resetSimulation: () => set((state) => ({
    isRunning: false,
    simTime: 0,
    currentStep: 0,
    crashed: false,
    cascadeTriggered: false,
    userId: state.userId, // Preserve user context
  })),
}));
