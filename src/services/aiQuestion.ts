import { supabase } from './supabase';
import { AIQuestion, UserProfile, DailyLog } from '@/types';

// 미답변 질문 중 가장 최근 것 조회
export const getTodayQuestion = async (
  userId: string
): Promise<AIQuestion | null> => {
  const { data, error } = await supabase
    .from('ai_questions')
    .select('*')
    .eq('user_id', userId)
    .is('answer_text', null)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error('미답변 질문 조회 실패:', error);
    return null;
  }

  return data;
};

// 질문 생성 요청 (Edge Function 호출)
export const generateQuestion = async (
  userId: string,
  profile: UserProfile,
  recentLogs: DailyLog[]
): Promise<AIQuestion | null> => {
  const { data, error } = await supabase.functions.invoke('generate-question', {
    body: {
      userId,
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
      recentLogs: recentLogs.map(log => ({
        date: log.date,
        text: log.text,
      })),
    },
  });

  if (error) {
    console.error('질문 생성 실패:', error);
    return null;
  }

  return data as AIQuestion;
};

// 질문에 답변 저장
export const answerQuestion = async (
  questionId: string,
  answerText: string
): Promise<boolean> => {
  const { error } = await supabase
    .from('ai_questions')
    .update({
      answer_text: answerText,
      answered_at: new Date().toISOString(),
    })
    .eq('id', questionId);

  if (error) {
    console.error('답변 저장 실패:', error);
    return false;
  }

  return true;
};

// 오래된 미답변 질문 삭제 (어제 이전 생성된 미답변 질문)
export const deleteOldUnansweredQuestions = async (
  userId: string
): Promise<void> => {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayEnd = yesterday.toISOString().split('T')[0] + 'T23:59:59';

  const { error } = await supabase
    .from('ai_questions')
    .delete()
    .eq('user_id', userId)
    .is('answer_text', null)
    .lt('created_at', yesterdayEnd);

  if (error) {
    console.error('오래된 질문 삭제 실패:', error);
  }
};

// 답변한 모든 질문 조회 (분석에 사용)
export const getAllAnsweredQuestions = async (
  userId: string
): Promise<AIQuestion[]> => {
  const { data, error } = await supabase
    .from('ai_questions')
    .select('*')
    .eq('user_id', userId)
    .not('answer_text', 'is', null)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('답변 질문 조회 실패:', error);
    return [];
  }

  return data || [];
};
