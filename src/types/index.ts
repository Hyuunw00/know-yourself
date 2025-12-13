// Database types
export * from './database';

// Navigation types
export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
};

export type AuthStackParamList = {
  Auth: undefined;
};

export type MainStackParamList = {
  Onboarding: undefined;
  Home: undefined;
  Profile: undefined;
  ProfileEdit: undefined;
  DailyLog: undefined;
  LogList: undefined;
  LogHistory: undefined;
  NotificationHistory: undefined;
  AIProfile: undefined;
  WeeklyReport: undefined;
};

// Screen names
export enum ScreenName {
  Onboarding = 'Onboarding',
  Home = 'Home',
  DailyLog = 'DailyLog',
  LogList = 'LogList',
  AIProfile = 'AIProfile',
  WeeklyReport = 'WeeklyReport',
}

// API Response types
export interface ApiResponse<T> {
  data?: T;
  error?: string;
}

// Onboarding Question
export interface OnboardingQuestion {
  id: string;
  text: string;
  type: 'text' | 'choice' | 'scale';
  options?: string[];
}
