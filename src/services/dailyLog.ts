import { supabase } from './supabase';
import { DailyLog } from '@/types';

// 일기 저장
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
    console.error('일기 저장 실패:', error);
    return null;
  }

  return data;
};

// 일기 불러오기
export const getDailyLogs = async (
  userId: string,
  options?: {
    limit?: number;
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

  query = query.order('updated_at', { ascending: false });

  if (options?.limit) {
    query = query.limit(options.limit);
  }

  const { data, error } = await query;

  if (error) {
    console.error('일기 불러오기 실패:', error);
    return [];
  }

  return data || [];
};

// 일기 수정
export const updateDailyLog = async (logId: string, text: string): Promise<DailyLog | null> => {
  const { data, error } = await supabase
    .from('daily_logs')
    .update({ text })
    .eq('id', logId)
    .select()
    .single();

  if (error) {
    console.error('일기 수정 실패:', error);
    return null;
  }

  return data;
};

// 일기 삭제
export const deleteDailyLog = async (logId: string): Promise<boolean> => {
  const { error } = await supabase
    .from('daily_logs')
    .delete()
    .eq('id', logId);

  if (error) {
    console.error('일기 삭제 실패:', error);
    return false;
  }

  return true;
};
