// ═══════════════════════════════════════════════════════════
// VEL AI — Credits Store (Zustand)
// ═══════════════════════════════════════════════════════════

import { create } from 'zustand';

interface CreditsState {
  balance: number;
  monthlyAlloc: number;
  usedThisMonth: number;
  isLoading: boolean;
  setBalance: (balance: number) => void;
  setCreditsInfo: (info: {
    balance: number;
    monthlyAlloc: number;
    usedThisMonth: number;
  }) => void;
  deductPreview: (amount: number) => void;
  getStatus: () => 'ok' | 'warn' | 'low';
}

export const useCreditStore = create<CreditsState>((set, get) => ({
  balance: 100,
  monthlyAlloc: 100,
  usedThisMonth: 0,
  isLoading: true,

  setBalance: (balance) => set({ balance, isLoading: false }),

  setCreditsInfo: (info) =>
    set({
      balance: info.balance,
      monthlyAlloc: info.monthlyAlloc,
      usedThisMonth: info.usedThisMonth,
      isLoading: false,
    }),

  deductPreview: (amount) =>
    set((state) => ({
      balance: Math.max(0, state.balance - amount),
      usedThisMonth: state.usedThisMonth + amount,
    })),

  getStatus: () => {
    const { balance, monthlyAlloc } = get();
    const ratio = balance / monthlyAlloc;
    if (ratio > 0.3) return 'ok';
    if (ratio > 0.1) return 'warn';
    return 'low';
  },
}));
