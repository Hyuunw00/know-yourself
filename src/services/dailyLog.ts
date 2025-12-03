import { supabase } from './supabase';
import { DailyLog } from '@/types';

// 기록 저장
export const saveDailyLog = async (
  userId: string,
  text: string,
  date?: string
): Promise<DailyLog | null> => {
  const logDate = date || new Date().toISOString().split('T')[0]; // YYYY-MM-DD

  const { data, error } = await supabase
    .from('daily_logs')
    .insert({
      user_id: userId,
      date: logDate,
      text,
    })
    .select()
    .single();

  if (error) {
    console.error('기록 저장 실패:', error);
    return null;
  }

  return data;
};

// 기록 불러오기
export const getDailyLogs = async (
  userId: string,
  options?: {
    limit?: number;
    offset?: number;
    startDate?: string;
    endDate?: string;
  }
): Promise<DailyLog[]> => {
  let query = supabase
    .from('daily_logs')
    .select('*')
    .eq('user_id', userId);

  if (options?.startDate) {
    query = query.gte('date', options.startDate);
  }
  if (options?.endDate) {
    query = query.lte('date', options.endDate);
  }

  query = query.order('date', { ascending: false }).order('updated_at', { ascending: false });

  if (options?.limit && options?.offset !== undefined) {
    query = query.range(options.offset, options.offset + options.limit - 1);
  } else if (options?.limit) {
    query = query.limit(options.limit);
  }

  const { data, error } = await query;

  if (error) {
    console.error('기록 불러오기 실패:', error);
    return [];
  }

  return data || [];
};

// 기록 수정
export const updateDailyLog = async (logId: string, text: string): Promise<DailyLog | null> => {
  const { data, error } = await supabase
    .from('daily_logs')
    .update({ text })
    .eq('id', logId)
    .select()
    .single();

  if (error) {
    console.error('기록 수정 실패:', error);
    return null;
  }

  return data;
};

// 기록 삭제
export const deleteDailyLog = async (logId: string): Promise<boolean> => {
  const { error } = await supabase
    .from('daily_logs')
    .delete()
    .eq('id', logId);

  if (error) {
    console.error('기록 삭제 실패:', error);
    return false;
  }

  return true;
};

// 전체 기록 개수 조회
export const getDailyLogCount = async (userId: string): Promise<number> => {
  const { count, error } = await supabase
    .from('daily_logs')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId);

  if (error) {
    console.error('기록 개수 조회 실패:', error);
    return 0;
  }

  return count || 0;
};

// 오늘 작성한 기록 개수 조회
export const getTodayLogCount = async (userId: string): Promise<number> => {
  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

  const { count, error } = await supabase
    .from('daily_logs')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('date', today);

  if (error) {
    console.error('오늘 기록 개수 조회 실패:', error);
    return 0;
  }

  return count || 0;
};

// 특정 날짜 이후의 로그 가져오기 (분석용)
export const getLogsAfterDate = async (
  userId: string,
  afterDate?: string
): Promise<DailyLog[]> => {
  let query = supabase
    .from('daily_logs')
    .select('*')
    .eq('user_id', userId);

  if (afterDate) {
    query = query.gt('created_at', afterDate);
  }

  const { data, error } = await query.order('created_at', { ascending: true });

  if (error) {
    console.error('로그 조회 실패:', error);
    return [];
  }

  return data || [];
};
