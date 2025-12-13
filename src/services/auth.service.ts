import { supabase } from '@/database/supabase';
import { translateErrorMessage } from '@/utils/errorMessage';
import { User } from '@supabase/supabase-js';

// 회원가입
export const signUp = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error) {
    return { user: null, error: translateErrorMessage(error.message) };
  }

  // 이미 가입된 이메일인 경우 체크
  if (data.user) {
    if (data.user.identities?.length === 0) {
      return { user: null, error: '이미 가입된 이메일입니다.' };
    }
    // 이미 이메일 인증된 유저가 다시 가입 시도하는 경우
    if (data.user.email_confirmed_at) {
      return { user: null, error: '이미 가입된 이메일입니다.' };
    }
  }

  return { user: data.user, error: null };
};

// 로그인
export const signIn = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    console.error('로그인 실패:', error.message);
    return { user: null, error: translateErrorMessage(error.message) };
  }

  return { user: data.user, error: null };
};

// 로그아웃
export const signOut = async () => {
  const { error } = await supabase.auth.signOut();

  if (error) {
    console.error('로그아웃 실패:', error.message);
    return { error: translateErrorMessage(error.message) };
  }

  return { error: null };
};

// 현재 유저 가져오기
export const getCurrentUser = async () => {
  const { data } = await supabase.auth.getUser();
  return data.user;
};

// 세션 변경 리스너
export const onAuthStateChange = (callback: (user: User | null) => void) => {
  return supabase.auth.onAuthStateChange((event, session) => {
    callback(session?.user ?? null);
  });
};
