import { supabase } from '@/database/supabase';
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

// AI 종합 분석 요청 (Edge Function에서 DB 저장까지 처리)
export const requestAnalysis = async (
  profile: UserProfile,
  logs: DailyLog[],
  aiQuestions: any[],
  logCount: number,
  previousAnalysis?: AIAnalysis | null,
  analysisNumber: number = 1,
): Promise<AIAnalysis | null> => {
  const { data, error } = await supabase.functions.invoke('analyze-log', {
    body: {
      profile: {
        user_id: profile.user_id,
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
      logCount,
    },
  });

  if (error) {
    console.error('[requestAnalysis] ❌ AI 분석 실패:', error);
    return null;
  }

  console.log('[requestAnalysis] ✅ AI 분석 성공 (DB 저장 완료)');
  return data as AIAnalysis;
};

// 분석 결과 저장
export const saveAnalysis = async (
  userId: string,
  logCount: number,
  analysisNumber: number,
  result: AnalysisResult,
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

  // 알림은 analyze-log Edge Function에서 send-notification을 호출하여 전송됨

  return data;
};

// 가장 최근 분석 결과 조회
export const getLatestAnalysis = async (
  userId: string,
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

