import { create } from 'zustand';
import { dayLogRepo } from '@/data/repositories/dayLogRepo';
import type { CloseDayLogInput, DayLog } from '@/domain/dayLog';
import { todayLocalDateString } from '@/domain/time';

interface DayLogStore {
  error: string | null;
  pending: boolean;
  clearError: () => void;
  openJourney: (at?: number) => Promise<DayLog | null>;
  closeJourney: (id: string, input: CloseDayLogInput) => Promise<DayLog | null>;
  updateLog: (id: string, patch: Partial<DayLog>) => Promise<DayLog | null>;
  removeLog: (id: string) => Promise<void>;
}

export const useDayLogStore = create<DayLogStore>((set) => ({
  error: null,
  pending: false,
  clearError: () => set({ error: null }),

  openJourney: async (at = Date.now()) => {
    set({ pending: true, error: null });
    try {
      const log = await dayLogRepo.open({
        date: todayLocalDateString(at),
        openedAt: at,
      });
      set({ pending: false });
      return log;
    } catch (e) {
      set({ pending: false, error: (e as Error).message });
      return null;
    }
  },

  closeJourney: async (id, input) => {
    set({ pending: true, error: null });
    try {
      const log = await dayLogRepo.close(id, input);
      set({ pending: false });
      return log;
    } catch (e) {
      set({ pending: false, error: (e as Error).message });
      return null;
    }
  },

  updateLog: async (id, patch) => {
    set({ pending: true, error: null });
    try {
      const log = await dayLogRepo.update(id, patch);
      set({ pending: false });
      return log;
    } catch (e) {
      set({ pending: false, error: (e as Error).message });
      return null;
    }
  },

  removeLog: async (id) => {
    set({ pending: true, error: null });
    try {
      await dayLogRepo.remove(id);
      set({ pending: false });
    } catch (e) {
      set({ pending: false, error: (e as Error).message });
    }
  },
}));
