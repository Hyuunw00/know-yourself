import React, { useEffect } from 'react';
import { StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { RootNavigator } from '@/navigation/RootNavigator';
import { useAuthStore } from '@/stores/authStore';
import {
  initializeFCM,
  setupForegroundMessageHandler,
} from '@/services/pushNotification';
import { supabase } from '@/services/supabase';

function App() {
  const { user } = useAuthStore();

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

  return (
    <SafeAreaProvider>
      <StatusBar barStyle="dark-content" />
      <RootNavigator />
    </SafeAreaProvider>
  );
}

export default App;
