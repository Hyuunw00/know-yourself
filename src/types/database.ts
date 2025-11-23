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
  // 성격/성향
  personality_keywords?: string[]; // 성격 키워드 (내향적, 계획적 등)
  strengths?: string[]; // 장점
  weaknesses?: string[]; // 단점
  // 라이프스타일
  interests?: string[]; // 관심사/취미
  likes?: string[]; // 좋아하는 것
  dislikes?: string[]; // 싫어하는 것
  stress_relief?: string[]; // 스트레스 해소법
  // 가치관/목표
  values?: string[]; // 가치관
  goals?: string[]; // 인생 목표
  bio?: string; // 자기소개 한 줄
  created_at: string;
  updated_at: string;
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
  summary?: string; // 유저에 대한 종합 요약
  personality_traits?: string[]; // 성격 특성
  strengths?: string[]; // 강점
  weaknesses?: string[]; // 약점
  keywords?: string[]; // 핵심 키워드
  raw_response?: Record<string, unknown>; // AI 원본 응답 전체
  insights?: AIInsight[]; // 추가 인사이트들
  created_at: string;
}

// AI 인사이트
export interface AIInsight {
  title: string;
  content: string;
}
