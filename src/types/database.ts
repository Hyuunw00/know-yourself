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

// AI 분석 결과
export interface AIAnalysis {
  id: string;
  daily_log_id: string;
  user_id: string;
  emotion?: string; // 감정 (예: "행복", "슬픔", "평온")
  energy_level?: number; // 에너지 레벨 (1-10)
  keywords?: string[]; // AI가 추출한 키워드
  summary?: string; // AI 요약
  created_at: string;
}

// AI 프로필 스냅샷 (시점별 AI가 생성한 유저 프로필)
export interface ProfileSnapshot {
  id: string;
  user_id: string;
  summary: string; // 유저에 대한 AI 요약
  strengths?: string[]; // 강점
  weaknesses?: string[]; // 약점
  keywords?: string[]; // 핵심 키워드
  personality_traits?: string[]; // 성격 특성
  created_at: string;
}

// 주간 리포트
export interface WeeklyReport {
  id: string;
  user_id: string;
  week_start_date: string;
  week_end_date: string;
  emotion_summary?: string; // 주간 감정 변화 요약
  patterns?: string[]; // 반복되는 패턴
  advice?: string; // AI 조언
  created_at: string;
}
