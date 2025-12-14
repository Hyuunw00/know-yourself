import { supabase } from '@/database/supabase';
import { DailyLog } from '@/types';

export interface DailyLogsResult {
  data: DailyLog[];
  count: number;
}

// 기록 조회 (필터링, 페이지네이션, count 포함)
export const getDailyLogs = async (
  userId: string,
  options?: {
    limit?: number;
    offset?: number;
    startDate?: string;
    endDate?: string;
  },
): Promise<DailyLogsResult> => {
  let query = supabase
    .from('daily_logs')
    .select('*', { count: 'exact' })
    .eq('user_id', userId);

  if (options?.startDate) {
    query = query.gte('date', options.startDate);
  }
  if (options?.endDate) {
    query = query.lte('date', options.endDate);
  }

  query = query
    .order('date', { ascending: false })
    .order('updated_at', { ascending: false });

  if (options?.limit && options?.offset !== undefined) {
    query = query.range(options.offset, options.offset + options.limit - 1);
  } else if (options?.limit) {
    query = query.limit(options.limit);
  }

  const { data, count, error } = await query;

  if (error) {
    console.error('기록 불러오기 실패:', error);
    return { data: [], count: 0 };
  }

  return { data: data || [], count: count || 0 };
};

// 기록 저장
export const saveDailyLog = async (
  userId: string,
  text: string,
  date?: string,
): Promise<DailyLog | null> => {
  const logDate = date || new Date().toISOString().split('T')[0];

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

// 기록 수정
export const updateDailyLog = async (
  logId: string,
  text: string,
): Promise<DailyLog | null> => {
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
