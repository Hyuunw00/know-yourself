import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Alert } from 'react-native';
import {
  getDailyLogs,
  getDailyLogCount,
  getTodayLogCount,
  saveDailyLog,
  updateDailyLog,
  deleteDailyLog,
} from '@/services/dailyLog.service';

const STALE_TIME = 5 * 60 * 1000; // 5분
const GC_TIME = 10 * 60 * 1000; // 10분

export const dailyLogKeys = {
  all: ['dailyLogs'] as const,
  lists: () => [...dailyLogKeys.all, 'list'] as const,
  list: (
    userId: string,
    filters?: { limit?: number; startDate?: string; endDate?: string },
  ) => [...dailyLogKeys.lists(), userId, filters] as const,
  count: (userId: string) => [...dailyLogKeys.all, 'count', userId] as const,
  todayCount: (userId: string) =>
    [...dailyLogKeys.all, 'todayCount', userId] as const,
  yearLogs: (userId: string, year: number) =>
    [...dailyLogKeys.all, 'year', userId, year] as const,
};

// 최근 기록 조회 (HomeScreen용 - 5개)
export const useRecentLogs = (userId: string | undefined) => {
  return useQuery({
    queryKey: dailyLogKeys.list(userId!, { limit: 5 }),
    queryFn: () => getDailyLogs(userId!, { limit: 5 }),
    enabled: !!userId,
    staleTime: STALE_TIME,
    gcTime: GC_TIME,
  });
};

// 연도별 기록 조회 (잔디 UI용)
export const useYearLogs = (userId: string | undefined, year: number) => {
  return useQuery({
    queryKey: dailyLogKeys.yearLogs(userId!, year),
    queryFn: () =>
      getDailyLogs(userId!, {
        startDate: `${year}-01-01`,
        endDate: `${year}-12-31`,
      }),
    enabled: !!userId,
    staleTime: STALE_TIME,
    gcTime: GC_TIME,
  });
};

// 전체 기록 개수 조회
export const useDailyLogCount = (userId: string | undefined) => {
  return useQuery({
    queryKey: dailyLogKeys.count(userId!),
    queryFn: () => getDailyLogCount(userId!),
    enabled: !!userId,
    staleTime: STALE_TIME,
    gcTime: GC_TIME,
  });
};

// 오늘 기록 개수 조회
export const useTodayLogCount = (userId: string | undefined) => {
  return useQuery({
    queryKey: dailyLogKeys.todayCount(userId!),
    queryFn: () => getTodayLogCount(userId!),
    enabled: !!userId,
    staleTime: STALE_TIME,
    gcTime: GC_TIME,
  });
};

// 기록 추가
export const useAddDailyLog = (userId: string | undefined) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (text: string) => {
      if (!userId) throw new Error('User not found');

      // 오늘 기록 개수 확인 (3개 제한)
      const todayCount = await getTodayLogCount(userId);
      if (todayCount >= 3) {
        throw new Error('DAILY_LIMIT_EXCEEDED');
      }

      return saveDailyLog(userId, text);
    },
    onSuccess: () => {
      // 관련 쿼리 무효화
      queryClient.invalidateQueries({ queryKey: dailyLogKeys.lists() });
      queryClient.invalidateQueries({ queryKey: dailyLogKeys.count(userId!) });
      queryClient.invalidateQueries({
        queryKey: dailyLogKeys.todayCount(userId!),
      });
      queryClient.invalidateQueries({
        queryKey: dailyLogKeys.yearLogs(userId!, new Date().getFullYear()),
      });
    },
    onError: (error: Error) => {
      if (error.message === 'DAILY_LIMIT_EXCEEDED') {
        Alert.alert(
          '기록 제한',
          '하루에 최대 3개까지 기록할 수 있어요.\n내일 다시 작성해주세요!',
          [{ text: '확인' }],
        );
      }
    },
  });
};

// 기록 수정
export const useUpdateDailyLog = (userId: string | undefined) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ logId, text }: { logId: string; text: string }) =>
      updateDailyLog(logId, text),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: dailyLogKeys.lists() });
      if (userId) {
        queryClient.invalidateQueries({
          queryKey: dailyLogKeys.yearLogs(userId, new Date().getFullYear()),
        });
      }
    },
  });
};

// 기록 삭제
export const useDeleteDailyLog = (userId: string | undefined) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (logId: string) => deleteDailyLog(logId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: dailyLogKeys.lists() });
      queryClient.invalidateQueries({ queryKey: dailyLogKeys.count(userId!) });
      queryClient.invalidateQueries({
        queryKey: dailyLogKeys.yearLogs(userId!, new Date().getFullYear()),
      });
    },
  });
};
