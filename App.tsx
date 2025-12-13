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
} from '@/services/pushNotification.service';
import { updateLastAppOpenAt } from '@/services/profile';
import { useNotificationStore } from '@/stores/notificationStore';

function App() {
  const { user } = useAuthStore();
  const { setPendingNotification } = useNotificationStore();

  // FCM 초기화 및 앱 실행 시간 기록
  useEffect(() => {
    if (user?.id) {
      initializeFCM(user.id);
      const unsubscribe = setupForegroundMessageHandler();

      updateLastAppOpenAt(user.id);

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
