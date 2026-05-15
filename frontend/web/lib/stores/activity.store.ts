// ═══════════════════════════════════════════════════════════
// VEL AI — Activity Store (Zustand)
// ═══════════════════════════════════════════════════════════

import { create } from 'zustand';
import type { ActivityEvent } from '@vel-ai/shared/types/workspace';

interface ActivityState {
  events: ActivityEvent[];
  addEvent: (event: Omit<ActivityEvent, 'id' | 'timestamp'>) => void;
  clearEvents: () => void;
}

let eventCounter = 0;

export const useActivityStore = create<ActivityState>((set) => ({
  events: [],

  addEvent: (event) => {
    const newEvent: ActivityEvent = {
      ...event,
      id: `evt-${++eventCounter}`,
      timestamp: Date.now(),
    };
    set((state) => ({
      events: [newEvent, ...state.events].slice(0, 50),
    }));
  },

  clearEvents: () => set({ events: [] }),
}));
