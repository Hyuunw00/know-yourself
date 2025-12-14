import {
  useQuery,
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';
import { Alert } from 'react-native';
import {
  getDailyLogs,
  saveDailyLog,
  updateDailyLog,
  deleteDailyLog,
} from '@/services';
import { getTodayISO } from '@/utils';
import { GC_TIME, STALE_TIME } from '@/constants';

export const dailyLogKeys = {
  all: ['dailyLogs'] as const,
  list: (
    userId: string,
    filters?: { limit?: number; startDate?: string; endDate?: string },
  ) => [...dailyLogKeys.all, 'list', userId, filters] as const,
};

export interface DailyLogsOptions {
  limit?: number;
  startDate?: string;
  endDate?: string;
}

// 기록 조회 (필터링 + count 포함)
export const useDailyLogs = (
  userId: string | undefined,
  options?: DailyLogsOptions,
) => {
  return useQuery({
    queryKey: dailyLogKeys.list(userId!, options),
    queryFn: () => getDailyLogs(userId!, options),
    enabled: !!userId,
    staleTime: STALE_TIME,
    gcTime: GC_TIME,
  });
};

// 기록 조회 - 무한스크롤 (LogHistoryScreen용)
export const useDailyLogsInfinite = (
  userId: string | undefined,
  options?: { startDate?: string; endDate?: string },
) => {
  return useInfiniteQuery({
    queryKey: dailyLogKeys.list(userId!, { ...options, limit: 10 }),
    queryFn: ({ pageParam = 0 }) =>
      getDailyLogs(userId!, {
        limit: 10,
        offset: pageParam,
        ...options,
      }),
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) =>
      lastPage.data.length === 10 ? allPages.length * 10 : undefined,
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
      const today = getTodayISO();
      const { count } = await getDailyLogs(userId, {
        startDate: today,
        endDate: today,
      });
      if (count >= 3) {
        throw new Error('DAILY_LIMIT_EXCEEDED');
      }

      return saveDailyLog(userId, text);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: dailyLogKeys.all });
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
export const useUpdateDailyLog = (_userId?: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ logId, text }: { logId: string; text: string }) =>
      updateDailyLog(logId, text),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: dailyLogKeys.all });
    },
  });
};

// 기록 삭제
export const useDeleteDailyLog = (_userId?: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (logId: string) => deleteDailyLog(logId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: dailyLogKeys.all });
    },
  });
};
