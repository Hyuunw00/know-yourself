import React, { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from '@/types';
import { HomeScreen } from '@/screens/HomeScreen';
import { AuthScreen } from '@/screens/AuthScreen';
import { OnboardingScreen } from '@/screens/OnboardingScreen';
import { ProfileScreen } from '@/screens/ProfileScreen';
import { useAuthStore } from '@/stores/authStore';
import { supabase } from '@/services/supabase';

const Stack = createNativeStackNavigator<RootStackParamList>();

export const RootNavigator = () => {
  const { user, isInitialized, initialize } = useAuthStore();
  const [hasProfile, setHasProfile] = useState<boolean | null>(null);
  const [showProfile, setShowProfile] = useState(false);

  // 앱 시작 시 인증 상태 확인
  useEffect(() => {
    initialize();
  }, [initialize]);

  // 프로필 존재 여부 확인
  useEffect(() => {
    const checkProfile = async () => {
      if (!user?.id) {
        setHasProfile(null);
        return;
      }

      const { data } = await supabase
        .from('user_profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      setHasProfile(!!data);
    };

    checkProfile();
  }, [user?.id]);

  // 초기화 중 로딩
  if (!isInitialized || (user && hasProfile === null)) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#4CAF50" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!user || !user.email_confirmed_at ? (
          // 비로그인 상태 또는 이메일 미인증
          <Stack.Screen name="Auth" component={AuthScreen} />
        ) : !hasProfile ? (
          // 로그인 + 이메일 인증 완료 + 프로필 없음 → 온보딩
          <Stack.Screen name="Onboarding">
            {() => (
              <OnboardingScreen
                onComplete={() => setHasProfile(true)}
                onGoProfile={() => {
                  setHasProfile(true);
                  setShowProfile(true);
                }}
              />
            )}
          </Stack.Screen>
        ) : showProfile ? (
          // 프로필 화면
          <Stack.Screen name="Profile">
            {() => <ProfileScreen onBack={() => setShowProfile(false)} />}
          </Stack.Screen>
        ) : (
          // 로그인 + 이메일 인증 + 프로필 있음 → 홈
          <Stack.Screen name="Home">
            {() => <HomeScreen onGoProfile={() => setShowProfile(true)} />}
          </Stack.Screen>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};
