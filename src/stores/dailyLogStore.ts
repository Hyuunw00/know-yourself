import { create } from 'zustand';
import { DailyLog } from '@/types';
import { saveDailyLog, getDailyLogs, updateDailyLog, deleteDailyLog } from '@/services/dailyLog';

interface DailyLogState {
  logs: DailyLog[];
  isLoading: boolean;
  error: string | null;

  // 액션
  fetchLogs: (userId: string) => Promise<void>;
  addLog: (userId: string, text: string) => Promise<boolean>;
  updateLog: (logId: string, text: string) => Promise<boolean>;
  deleteLog: (logId: string) => Promise<boolean>;
  clearLogs: () => void;
}

export const useDailyLogStore = create<DailyLogState>((set) => ({
  logs: [],
  isLoading: false,
  error: null,

  // 일기 목록 불러오기
  fetchLogs: async (userId: string) => {
    set({ isLoading: true, error: null });

    const logs = await getDailyLogs(userId, { limit: 10 });

    set({ logs, isLoading: false });
  },

  // 일기 추가
  addLog: async (userId: string, text: string) => {
    set({ isLoading: true, error: null });

    const newLog = await saveDailyLog(userId, text);

    if (newLog) {
      set((state) => ({
        logs: [newLog, ...state.logs],
        isLoading: false,
      }));
      return true;
    }

    set({ isLoading: false, error: '저장 실패' });
    return false;
  },

  // 일기 수정
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

  // 일기 삭제
  deleteLog: async (logId: string) => {
    const success = await deleteDailyLog(logId);

    if (success) {
      set((state) => ({
        logs: state.logs.filter((log) => log.id !== logId),
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
