import { create } from 'zustand';

interface LogHistoryFilterState {
  startDate: string | undefined;
  endDate: string | undefined;
  setStartDate: (date: string | undefined) => void;
  setEndDate: (date: string | undefined) => void;
  clearFilters: () => void;
  initializeDefaultDates: () => void;
}

const getDefaultDates = () => {
  const today = new Date();
  const oneMonthAgo = new Date();
  oneMonthAgo.setMonth(today.getMonth() - 1);

  return {
    end: today.toISOString().split('T')[0],
    start: oneMonthAgo.toISOString().split('T')[0],
  };
};

export const useLogHistoryFilterStore = create<LogHistoryFilterState>((set) => ({
  startDate: undefined,
  endDate: undefined,

  setStartDate: (date) => set({ startDate: date }),
  setEndDate: (date) => set({ endDate: date }),

  clearFilters: () => set({ startDate: undefined, endDate: undefined }),

  initializeDefaultDates: () => {
    const defaults = getDefaultDates();
    set({ startDate: defaults.start, endDate: defaults.end });
  },
}));
