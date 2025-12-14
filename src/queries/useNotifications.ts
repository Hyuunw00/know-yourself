import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
} from '@/services/notification.service';
import { GC_TIME, STALE_TIME } from '@/constants/query';

export const notificationKeys = {
  all: ['notifications'] as const,
  list: (userId: string) => [...notificationKeys.all, 'list', userId] as const,
  unreadCount: (userId: string) =>
    [...notificationKeys.all, 'unreadCount', userId] as const,
};

// 알림 목록 (무한스크롤)
export const useNotificationsInfinite = (userId: string | undefined) => {
  return useInfiniteQuery({
    queryKey: notificationKeys.list(userId!),
    queryFn: ({ pageParam = 0 }) => getNotifications(userId!, 10, pageParam),
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) =>
      lastPage.length === 10 ? allPages.length * 10 : undefined,
    enabled: !!userId,
    staleTime: STALE_TIME,
    gcTime: GC_TIME,
  });
};

// 안 읽은 알림 개수
export const useUnreadCount = (userId: string | undefined) => {
  return useQuery({
    queryKey: notificationKeys.unreadCount(userId!),
    queryFn: () => getUnreadCount(userId!),
    enabled: !!userId,
    staleTime: STALE_TIME,
    gcTime: GC_TIME,
  });
};

// 알림 읽음 처리
export const useMarkAsRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (notificationId: string) => markAsRead(notificationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.all });
    },
  });
};

// 모든 알림 읽음 처리
export const useMarkAllAsRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: string) => markAllAsRead(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.all });
    },
  });
};

// 알림 삭제
export const useDeleteNotification = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (notificationId: string) => deleteNotification(notificationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.all });
    },
  });
};
