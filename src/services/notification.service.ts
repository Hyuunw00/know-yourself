import { supabase } from '@/database/supabase';
import { Notification } from '@/types';

/**
 * 알림 목록 조회 (페이지네이션)
 * @param userId 사용자 ID
 * @param limit 가져올 개수 (기본: 20)
 * @param offset 건너뛸 개수 (기본: 0)
 */
export const getNotifications = async (
  userId: string,
  limit: number = 20,
  offset: number = 0,
): Promise<Notification[]> => {
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    console.error('알림 목록 조회 실패:', error);
    return [];
  }

  return data || [];
};

/**
 * 안 읽은 알림 개수 조회
 * @param userId 사용자 ID
 */
export const getUnreadCount = async (userId: string): Promise<number> => {
  const { count, error } = await supabase
    .from('notifications')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('read', false);

  if (error) {
    console.error('안 읽은 알림 개수 조회 실패:', error);
    return 0;
  }

  return count || 0;
};

/**
 * 알림을 읽음으로 표시
 * @param notificationId 알림 ID
 */
export const markAsRead = async (notificationId: string): Promise<boolean> => {
  const { error } = await supabase
    .from('notifications')
    .update({ read: true })
    .eq('id', notificationId);

  if (error) {
    console.error('알림 읽음 표시 실패:', error);
    return false;
  }

  return true;
};

/**
 * 모든 알림을 읽음으로 표시
 * @param userId 사용자 ID
 */
export const markAllAsRead = async (userId: string): Promise<boolean> => {
  const { error } = await supabase
    .from('notifications')
    .update({ read: true })
    .eq('user_id', userId)
    .eq('read', false);

  if (error) {
    console.error('모든 알림 읽음 표시 실패:', error);
    return false;
  }

  return true;
};

/**
 * 알림 삭제
 * @param notificationId 알림 ID
 */
export const deleteNotification = async (
  notificationId: string,
): Promise<boolean> => {
  const { error } = await supabase
    .from('notifications')
    .delete()
    .eq('id', notificationId);

  if (error) {
    console.error('알림 삭제 실패:', error);
    return false;
  }

  return true;
};

/**
 * 모든 알림 삭제
 * @param userId 사용자 ID
 */
export const deleteAllNotifications = async (
  userId: string,
): Promise<boolean> => {
  const { error } = await supabase
    .from('notifications')
    .delete()
    .eq('user_id', userId);

  if (error) {
    console.error('모든 알림 삭제 실패:', error);
    return false;
  }

  return true;
};

/**
 * 특정 타입의 알림 조회
 * @param userId 사용자 ID
 * @param type 알림 타입
 * @param limit 가져올 개수
 */
export const getNotificationsByType = async (
  userId: string,
  type: string,
  limit: number = 20,
): Promise<Notification[]> => {
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', userId)
    .eq('type', type)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('타입별 알림 조회 실패:', error);
    return [];
  }

  return data || [];
};
