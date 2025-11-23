import { supabase } from './supabase';
import { UserProfile } from '@/types';

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
    return { success: false, error: error.message };
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
    return { success: false, error: error.message };
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
