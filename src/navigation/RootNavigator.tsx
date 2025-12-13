import React, { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { useAuthStore } from '@/stores/authStore';
import { AuthStack } from './AuthStack';
import { MainStack } from './MainStack';

export const RootNavigator = () => {
  const { user, isInitialized, initialize } = useAuthStore();

  // 앱 시작 시 인증 상태 확인
  useEffect(() => {
    initialize();
  }, [initialize]);

  // 초기화 중 로딩
  if (!isInitialized) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#4CAF50" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {!user || !user.email_confirmed_at ? <AuthStack /> : <MainStack />}
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
