import { supabase } from './supabase';
import { AIAnalysis, UserProfile, DailyLog } from '@/types';

export interface AnalysisResult {
  one_liner: string;
  keywords: string[];
  strengths_analysis: string;
  growth_points: string;
  emotional_patterns?: string;
  behavioral_habits?: string;
  insights: { title: string; content: string }[];
}

// AI 종합 분석 요청
export const requestAnalysis = async (
  profile: UserProfile,
  logs: DailyLog[],
  aiQuestions: any[],
  previousAnalysis?: AIAnalysis | null,
  analysisNumber: number = 1
): Promise<AnalysisResult | null> => {
  const { data, error } = await supabase.functions.invoke('analyze-log', {
    body: {
      profile: {
        name: profile.name,
        birthdate: profile.birthdate,
        gender: profile.gender,
        mbti: profile.mbti,
        occupation: profile.occupation,
        interests: profile.interests,
        values: profile.values,
        goals: profile.goals,
        strengths: profile.strengths,
        weaknesses: profile.weaknesses,
      },
      logs: logs.map(log => ({
        date: log.date,
        text: log.text,
      })),
      aiQuestions: aiQuestions.map(qa => ({
        question_text: qa.question_text,
        answer_text: qa.answer_text,
      })),
      previousAnalysis: previousAnalysis
        ? {
            one_liner: previousAnalysis.one_liner,
            keywords: previousAnalysis.keywords,
            strengths_analysis: previousAnalysis.strengths_analysis,
            growth_points: previousAnalysis.growth_points,
          }
        : undefined,
      analysisNumber,
    },
  });

  if (error) {
    console.error('AI 분석 실패:', error);
    return null;
  }

  return data as AnalysisResult;
};

// 분석 결과 저장
export const saveAnalysis = async (
  userId: string,
  logCount: number,
  analysisNumber: number,
  result: AnalysisResult
): Promise<AIAnalysis | null> => {
  const { data, error } = await supabase
    .from('ai_analyses')
    .insert({
      user_id: userId,
      analysis_number: analysisNumber,
      log_count: logCount,
      one_liner: result.one_liner,
      keywords: result.keywords,
      strengths_analysis: result.strengths_analysis,
      growth_points: result.growth_points,
      emotional_patterns: result.emotional_patterns,
      behavioral_habits: result.behavioral_habits,
      insights: result.insights,
      raw_response: result,
    })
    .select()
    .single();

  if (error) {
    console.error('분석 결과 저장 실패:', error);
    return null;
  }

  return data;
};

// 가장 최근 분석 결과 조회
export const getLatestAnalysis = async (
  userId: string
): Promise<AIAnalysis | null> => {
  const { data, error } = await supabase
    .from('ai_analyses')
    .select('*')
    .eq('user_id', userId)
    .order('analysis_number', { ascending: false })
    .limit(1)
    .single();

  if (error) {
    if (error.code !== 'PGRST116') {
      console.error('분석 결과 조회 실패:', error);
    }
    return null;
  }

  return data;
};

// 사용자의 모든 분석 결과 조회
export const getAllAnalyses = async (userId: string): Promise<AIAnalysis[]> => {
  const { data, error } = await supabase
    .from('ai_analyses')
    .select('*')
    .eq('user_id', userId)
    .order('analysis_number', { ascending: false });

  if (error) {
    console.error('분석 결과 목록 조회 실패:', error);
    return [];
  }

  return data || [];
};

// 분석이 필요한지 체크 (10의 배수)
export const shouldTriggerAnalysis = (
  logCount: number,
  lastAnalysisLogCount: number
): boolean => {
  // 10의 배수이고, 마지막 분석 이후 새 기록이 있는 경우
  return logCount >= 10 && logCount % 10 === 0 && logCount > lastAnalysisLogCount;
};
