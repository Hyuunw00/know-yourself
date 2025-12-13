import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  requestAnalysis,
  getLatestAnalysis,
  getAllAnalyses,
} from '@/services/analysis.service';
import { getLogsAfterDate } from '@/services/dailyLog.service';
import { getAllAnsweredQuestions } from '@/services/aiQuestion.service';
import { UserProfile, AIAnalysis } from '@/types';
import { GC_TIME, STALE_TIME } from '@/constants/query';

export const analysisKeys = {
  all: ['analysis'] as const,
  latest: (userId: string) => [...analysisKeys.all, 'latest', userId] as const,
  list: (userId: string) => [...analysisKeys.all, 'list', userId] as const,
};

// 최신 분석 결과 조회
export const useLatestAnalysis = (userId: string | undefined) => {
  return useQuery({
    queryKey: analysisKeys.latest(userId!),
    queryFn: () => getLatestAnalysis(userId!),
    enabled: !!userId,
    staleTime: STALE_TIME,
    gcTime: GC_TIME,
  });
};

// 전체 분석 결과 목록 조회
export const useAllAnalyses = (userId: string | undefined) => {
  return useQuery({
    queryKey: analysisKeys.list(userId!),
    queryFn: () => getAllAnalyses(userId!),
    enabled: !!userId,
    staleTime: STALE_TIME,
    gcTime: GC_TIME,
  });
};

// 분석 실행 mutation
interface RunAnalysisParams {
  userId: string;
  profile: UserProfile;
  logCount: number;
  latestAnalysis: AIAnalysis | null;
}

export const useRunAnalysis = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      userId,
      profile,
      logCount,
      latestAnalysis,
    }: RunAnalysisParams) => {
      const analysisNumber = latestAnalysis
        ? latestAnalysis.analysis_number + 1
        : 1;

      // 마지막 분석 이후의 로그만 가져오기
      const logsToAnalyze = await getLogsAfterDate(
        userId,
        latestAnalysis?.created_at,
      );

      // 답변된 AI 질문들 가져오기
      const aiQuestions = await getAllAnsweredQuestions(userId);

      // AI 분석 요청
      const savedAnalysis = await requestAnalysis(
        profile,
        logsToAnalyze,
        aiQuestions,
        logCount,
        latestAnalysis,
        analysisNumber,
      );

      if (!savedAnalysis) {
        throw new Error('분석 결과를 받지 못했습니다.');
      }

      return savedAnalysis;
    },
    onSuccess: (_, variables) => {
      // 분석 완료 후 캐시 무효화
      queryClient.invalidateQueries({
        queryKey: analysisKeys.latest(variables.userId),
      });
      queryClient.invalidateQueries({
        queryKey: analysisKeys.list(variables.userId),
      });
    },
  });
};
