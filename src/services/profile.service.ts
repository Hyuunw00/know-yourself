import { supabase } from '@/database/supabase';
import { UserProfile } from '@/types';
import { translateErrorMessage } from '@/utils/errorMessage';

// 프로필 조회
export const getProfile = async (userId: string): Promise<UserProfile | null> => {
  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error) {
    console.error('프로필 조회 실패:', error.message);
    return null;
  }

  return data;
};

// 프로필 생성
export const createProfile = async (
  userId: string,
  profile: Partial<UserProfile>
): Promise<{ success: boolean; error?: string }> => {
  const { error } = await supabase.from('user_profiles').insert({
    user_id: userId,
    ...profile,
  });

  if (error) {
    console.error('프로필 생성 실패:', error.message);
    return { success: false, error: translateErrorMessage(error.message) };
  }

  return { success: true };
};

// 프로필 수정
export const updateProfile = async (
  userId: string,
  profile: Partial<UserProfile>
): Promise<{ success: boolean; error?: string }> => {
  const { error } = await supabase
    .from('user_profiles')
    .update(profile)
    .eq('user_id', userId);

  if (error) {
    console.error('프로필 수정 실패:', error.message);
    return { success: false, error: translateErrorMessage(error.message) };
  }

  return { success: true };
};

// 프로필 존재 여부 확인
export const checkProfileExists = async (userId: string): Promise<boolean> => {
  const { data } = await supabase
    .from('user_profiles')
    .select('id')
    .eq('user_id', userId)
    .single();

  return !!data;
};

// 마지막 앱 접근 시간 업데이트
export const updateLastAppOpenAt = async (userId: string): Promise<void> => {
  const { error } = await supabase
    .from('user_profiles')
    .update({ last_app_open_at: new Date().toISOString() })
    .eq('user_id', userId);

  if (error) {
    console.error('last_app_open_at 업데이트 실패:', error.message);
  }
};

// 계정 삭제 (사용자 데이터 모두 삭제)
export const deleteAccount = async (
  userId: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    // 1. daily_logs 삭제
    const { error: logsError } = await supabase
      .from('daily_logs')
      .delete()
      .eq('user_id', userId);

    if (logsError) throw logsError;

    // 2. ai_analyses 삭제
    const { error: analysesError } = await supabase
      .from('ai_analyses')
      .delete()
      .eq('user_id', userId);

    if (analysesError) throw analysesError;

    // 3. ai_questions 삭제
    const { error: questionsError } = await supabase
      .from('ai_questions')
      .delete()
      .eq('user_id', userId);

    if (questionsError) throw questionsError;

    // 4. notifications 삭제
    const { error: notificationsError } = await supabase
      .from('notifications')
      .delete()
      .eq('user_id', userId);

    if (notificationsError) throw notificationsError;

    // 5. push_tokens 삭제
    const { error: tokensError } = await supabase
      .from('push_tokens')
      .delete()
      .eq('user_id', userId);

    if (tokensError) throw tokensError;

    // 6. onboarding_answers 삭제
    const { error: answersError } = await supabase
      .from('onboarding_answers')
      .delete()
      .eq('user_id', userId);

    if (answersError) throw answersError;

    // 7. user_profiles 삭제
    const { error: profileError } = await supabase
      .from('user_profiles')
      .delete()
      .eq('user_id', userId);

    if (profileError) throw profileError;

    // 8. Supabase Auth 계정 삭제
    const { error: authError } = await supabase.auth.admin.deleteUser(userId);

    if (authError) throw authError;

    return { success: true };
  } catch (error: any) {
    console.error('계정 삭제 실패:', error.message);
    return { success: false, error: translateErrorMessage(error.message) };
  }
};
