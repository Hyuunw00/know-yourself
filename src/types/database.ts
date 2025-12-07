// 사용자 인증 정보 (Supabase Auth)
export interface User {
  id: string;
  email: string;
  created_at: string;
}

// 사용자 상세 프로필
export interface UserProfile {
  id: string;
  user_id: string;
  name: string;
  birthdate?: string; // YYYY-MM-DD
  gender?: 'male' | 'female' | 'other';
  mbti?: string;
  occupation?: string;

  personality_keywords?: string[]; // 성격 키워드 (내향적, 계획적 등)
  interests?: string[]; // 관심사/취미
  likes?: string; // 좋아하는 것
  dislikes?: string; // 싫어하는 것

  strengths?: string; // 장점
  weaknesses?: string; // 단점
  values?: string; // 가치관
  goals?: string; // 인생 목표
  stress_relief?: string; // 스트레스 해소법
  bio?: string; // 자기소개 한 줄

  created_at: string;
  updated_at: string;
  last_app_open_at?: string;
}

// 온보딩 설문 답변
export interface OnboardingAnswer {
  id: string;
  user_id: string;
  question_id: string;
  question_text: string;
  answer: string;
  created_at: string;
}

// 일일 기록
export interface DailyLog {
  id: string;
  user_id: string;
  date: string;
  text: string;
  created_at: string;
  updated_at: string;
}

// AI 종합 분석 결과
export interface AIAnalysis {
  id: string;
  user_id: string;
  analysis_number: number; // 1차, 2차, 3차...
  log_count: number; // 분석 시점 기록 수 (10, 20, 30...)
  one_liner?: string; // 한 줄 정의
  keywords?: string[]; // AI가 발견한 핵심 키워드
  strengths_analysis?: string; // 강점 분석
  growth_points?: string; // 약점/개선점 분석
  emotional_patterns?: string; // 감정 패턴 분석
  behavioral_habits?: string; // 행동 습관 분석
  insights?: AIInsight[]; // AI 인사이트들
  raw_response?: Record<string, unknown>; // AI 원본 응답 전체
  created_at: string;
}

// AI 인사이트
export interface AIInsight {
  title: string;
  content: string;
}

// AI 질문
export interface AIQuestion {
  id: string;
  user_id: string;
  question_text: string;
  answer_text?: string;
  context?: Record<string, unknown>;
  answered_at?: string;
  skipped?: boolean; // 답변 안하기로 건너뛴 질문
  created_at: string;
}

// FCM 푸시 토큰
export interface PushToken {
  id: string;
  user_id: string;
  token: string;
  platform: 'ios' | 'android';
  created_at: string;
  updated_at: string;
}

// 알림 타입
export type NotificationType =
  | 'ai_question'
  | 'analysis_complete'
  | 'reminder'
  | 'system';

// 알림
export interface Notification {
  id: string;
  user_id: string;
  type: NotificationType;
  title: string;
  body: string;
  data?: Record<string, unknown>; // question_id, analysis_id 등
  read: boolean;
  created_at: string;
  sent_at?: string;
}
