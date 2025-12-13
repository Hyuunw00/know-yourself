import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthScreen } from '@/screens/AuthScreen';
import { AuthStackParamList } from '@/types';

const Stack = createNativeStackNavigator<AuthStackParamList>();

export const AuthStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Auth" component={AuthScreen} />
    </Stack.Navigator>
  );
};
