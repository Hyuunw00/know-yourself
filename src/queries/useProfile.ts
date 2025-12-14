import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  getProfile,
  updateProfile,
  updateLastAppOpenAt,
  deleteAccount,
} from '@/services';
import { UserProfile } from '@/types';
import { GC_TIME, STALE_TIME } from '@/constants';

export const profileKeys = {
  all: ['profile'] as const,
  detail: (userId: string) => [...profileKeys.all, userId] as const,
};

// 프로필 조회
export const useProfile = (userId: string | undefined) => {
  return useQuery({
    queryKey: profileKeys.detail(userId!),
    queryFn: () => getProfile(userId!),
    enabled: !!userId,
    staleTime: STALE_TIME,
    gcTime: GC_TIME,
  });
};

// 프로필 수정
export const useUpdateProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      userId,
      profile,
    }: {
      userId: string;
      profile: Partial<UserProfile>;
    }) => updateProfile(userId, profile),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: profileKeys.detail(variables.userId),
      });
    },
  });
};

// 마지막 앱 접근 시간 업데이트 (캐시 무효화 불필요)
export const useUpdateLastAppOpenAt = () => {
  return useMutation({
    mutationFn: (userId: string) => updateLastAppOpenAt(userId),
  });
};

// 계정 삭제
export const useDeleteAccount = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: string) => deleteAccount(userId),
    onSuccess: () => {
      queryClient.clear();
    },
  });
};
