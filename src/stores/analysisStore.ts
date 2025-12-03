import { create } from 'zustand';
import { AIAnalysis, UserProfile } from '@/types';
import {
  requestAnalysis,
  saveAnalysis,
  getLatestAnalysis,
  getAllAnalyses,
} from '@/services/analysis';
import { getLogsAfterDate } from '@/services/dailyLog';
import { getAllAnsweredQuestions } from '@/services/aiQuestion';

// 분석 트리거 간격 (이 값만 바꾸면 5, 10, 20 등으로 조절 가능)
export const ANALYSIS_INTERVAL = 10;

interface AnalysisState {
  // 상태
  latestAnalysis: AIAnalysis | null;
  allAnalyses: AIAnalysis[];
  isAnalyzing: boolean;
  error: string | null;

  // 액션
  fetchLatestAnalysis: (userId: string) => Promise<void>;
  fetchAllAnalyses: (userId: string) => Promise<void>;
  runAnalysis: (
    userId: string,
    profile: UserProfile,
    logCount: number,
  ) => Promise<AIAnalysis | null>;
  checkAndTriggerAnalysis: (
    userId: string,
    profile: UserProfile,
    logCount: number,
  ) => Promise<void>;
  reset: () => void;
}

export const useAnalysisStore = create<AnalysisState>((set, get) => ({
  latestAnalysis: null,
  allAnalyses: [],
  isAnalyzing: false,
  error: null,

  fetchLatestAnalysis: async (userId: string) => {
    const analysis = await getLatestAnalysis(userId);
    set({ latestAnalysis: analysis });
  },

  fetchAllAnalyses: async (userId: string) => {
    const analyses = await getAllAnalyses(userId);
    set({ allAnalyses: analyses });
  },

  runAnalysis: async (
    userId: string,
    profile: UserProfile,
    logCount: number,
  ) => {
    const { latestAnalysis } = get();

    set({ isAnalyzing: true, error: null });

    try {
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
      const result = await requestAnalysis(
        profile,
        logsToAnalyze,
        aiQuestions,
        latestAnalysis,
        analysisNumber,
      );

      if (!result) {
        throw new Error('분석 결과를 받지 못했습니다.');
      }

      // 결과 저장
      const savedAnalysis = await saveAnalysis(
        userId,
        logCount,
        analysisNumber,
        result,
      );

      if (savedAnalysis) {
        // 최신 분석 다시 불러오기 (DB에서 created_at 최신순으로)
        const latestFromDB = await getLatestAnalysis(userId);

        set({
          latestAnalysis: latestFromDB || savedAnalysis,
          allAnalyses: [savedAnalysis, ...get().allAnalyses],
          isAnalyzing: false,
        });
        return savedAnalysis;
      }

      throw new Error('분석 결과 저장에 실패했습니다.');
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : '알 수 없는 오류';
      set({ error: errorMessage, isAnalyzing: false });
      return null;
    }
  },

  // 분석 트리거 체크 후 백그라운드 분석 실행
  checkAndTriggerAnalysis: async (
    userId: string,
    profile: UserProfile,
    logCount: number,
  ) => {
    const { latestAnalysis, runAnalysis } = get();
    const lastAnalysisLogCount = latestAnalysis?.log_count || 0;

    // ANALYSIS_INTERVAL의 배수이고, 마지막 분석 이후 새 기록이 있는 경우
    if (
      logCount >= ANALYSIS_INTERVAL &&
      logCount % ANALYSIS_INTERVAL === 0 &&
      logCount > lastAnalysisLogCount
    ) {
      // 백그라운드로 실행 (await 없음)
      runAnalysis(userId, profile, logCount);
    }
  },

  reset: () => {
    set({
      latestAnalysis: null,
      allAnalyses: [],
      isAnalyzing: false,
      error: null,
    });
  },
}));

// 프로필이 완전히 채워졌는지 체크
export const isProfileComplete = (profile: UserProfile): boolean => {
  return !!(
    profile.name &&
    profile.birthdate &&
    profile.gender &&
    profile.mbti &&
    profile.occupation &&
    profile.personality_keywords?.length &&
    profile.strengths?.length &&
    profile.weaknesses?.length &&
    profile.interests?.length &&
    profile.values?.length &&
    profile.goals?.length
  );
};
