import { create } from 'zustand';

interface NotificationState {
  // 백그라운드 알림 클릭으로 앱 진입 시 pending notification 데이터
  pendingNotification: Record<string, any> | null;

  // 액션
  setPendingNotification: (data: Record<string, any> | null) => void;
  clearPendingNotification: () => void;
}

export const useNotificationStore = create<NotificationState>(set => ({
  pendingNotification: null,

  setPendingNotification: (data: Record<string, any> | null) => {
    set({ pendingNotification: data });
  },

  clearPendingNotification: () => {
    set({ pendingNotification: null });
  },
}));
