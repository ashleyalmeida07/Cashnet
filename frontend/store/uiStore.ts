import { create } from 'zustand';

export interface Toast {
  id: string;
  message: string;
  severity: 'info' | 'success' | 'warning' | 'error';
}

interface UIState {
  sidebarOpen: boolean;
  activeNavItem: string;
  toasts: Toast[];
  setSidebarOpen: (open: boolean) => void;
  setActiveNavItem: (item: string) => void;
  addToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;
}

let toastCounter = 0;

export const useUIStore = create<UIState>((set) => ({
  sidebarOpen: true,
  activeNavItem: '/dashboard',
  toasts: [],
  
  setSidebarOpen: (open: boolean) => set({ sidebarOpen: open }),
  
  setActiveNavItem: (item: string) => set({ activeNavItem: item }),
  
  addToast: (toast: Omit<Toast, 'id'>) => {
    const id = `toast-${toastCounter++}`;
    set((state) => ({ toasts: [...state.toasts, { ...toast, id }] }));
    
    // Auto-dismiss after 5 seconds
    setTimeout(() => {
      set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }));
    }, 5000);
  },
  
  removeToast: (id: string) => set((state) => ({
    toasts: state.toasts.filter((t) => t.id !== id),
  })),
}));
