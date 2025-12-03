import { create } from 'zustand';
import { DailyLog } from '@/types';
import { saveDailyLog, getDailyLogs, updateDailyLog, deleteDailyLog, getDailyLogCount } from '@/services/dailyLog';

interface DailyLogState {
  logs: DailyLog[];
  totalCount: number;
  isLoading: boolean;
  error: string | null;

  // 액션
  fetchLogs: (userId: string) => Promise<void>;
  fetchTotalCount: (userId: string) => Promise<number>;
  addLog: (userId: string, text: string) => Promise<boolean>;
  updateLog: (logId: string, text: string) => Promise<boolean>;
  deleteLog: (logId: string) => Promise<boolean>;
  clearLogs: () => void;
}

export const useDailyLogStore = create<DailyLogState>((set) => ({
  logs: [],
  totalCount: 0,
  isLoading: false,
  error: null,

  // 기록 목록 불러오기
  fetchLogs: async (userId: string) => {
    set({ isLoading: true, error: null });

    const [logs, count] = await Promise.all([
      getDailyLogs(userId, { limit: 5 }),
      getDailyLogCount(userId),
    ]);

    set({ logs, totalCount: count, isLoading: false });
  },

  // 전체 개수만 불러오기
  fetchTotalCount: async (userId: string) => {
    const count = await getDailyLogCount(userId);
    set({ totalCount: count });
    return count;
  },

  // 기록 추가
  addLog: async (userId: string, text: string) => {
    set({ isLoading: true, error: null });

    const newLog = await saveDailyLog(userId, text);

    if (newLog) {
      set((state) => ({
        logs: [newLog, ...state.logs],
        totalCount: state.totalCount + 1,
        isLoading: false,
      }));
      return true;
    }

    set({ isLoading: false, error: '저장 실패' });
    return false;
  },

  // 기록 수정
  updateLog: async (logId: string, text: string) => {
    const updatedLog = await updateDailyLog(logId, text);

    if (updatedLog) {
      set((state) => ({
        logs: state.logs.map((log) => (log.id === logId ? updatedLog : log)),
      }));
      return true;
    }

    return false;
  },

  // 기록 삭제
  deleteLog: async (logId: string) => {
    const success = await deleteDailyLog(logId);

    if (success) {
      set((state) => ({
        logs: state.logs.filter((log) => log.id !== logId),
        totalCount: state.totalCount - 1,
      }));
      return true;
    }

    return false;
  },

  // 로그 초기화 (로그아웃 시)
  clearLogs: () => {
    set({ logs: [], error: null });
  },
}));
