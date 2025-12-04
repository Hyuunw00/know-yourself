import React, { useEffect } from 'react';
import { StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { RootNavigator } from '@/navigation/RootNavigator';
import { useAuthStore } from '@/stores/authStore';
import {
  initializeFCM,
  setupForegroundMessageHandler,
  setupNotificationOpenedListener,
} from '@/services/pushNotification';
import { supabase } from '@/services/supabase';
import { useNotificationStore } from '@/stores/notificationStore';

function App() {
  const { user } = useAuthStore();
  const { setPendingNotification } = useNotificationStore();

  // FCM 초기화 및 앱 실행 시간 기록
  useEffect(() => {
    if (user?.id) {
      // FCM 초기화
      initializeFCM(user.id);
      const unsubscribe = setupForegroundMessageHandler();

      // 앱 실행 시간 업데이트
      supabase
        .from('user_profiles')
        .update({ last_app_open_at: new Date().toISOString() })
        .eq('id', user.id)
        .then(({ error }) => {
          if (error) {
            console.error('last_app_open_at 업데이트 실패:', error);
          }
        });

      return unsubscribe;
    }
  }, [user?.id]);

  // 알림 클릭 리스너 설정
  useEffect(() => {
    setupNotificationOpenedListener(remoteMessage => {
      console.log('알림 클릭으로 앱 진입:', remoteMessage);

      // 알림 데이터를 store에 저장 (HomeScreen에서 처리)
      if (remoteMessage.data) {
        setPendingNotification(remoteMessage.data);
      }
    });
  }, [setPendingNotification]);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <StatusBar barStyle="dark-content" />
        <RootNavigator />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

export default App;
