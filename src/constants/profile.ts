// 성격 키워드
export const PERSONALITY_KEYWORDS = [
  '내향적', '외향적', '계획적', '즉흥적',
  '감성적', '이성적', '낙관적', '현실적',
  '독립적', '협력적', '꼼꼼한', '대범한',
  '신중한', '도전적', '창의적', '분석적',
] as const;

// 관심사/취미
export const INTERESTS = [
  '독서', '영화/드라마', '음악', '운동',
  '여행', '게임', '요리', '사진',
  '그림/미술', '글쓰기', '코딩', '투자',
  '패션', '뷰티', '반려동물', '자기계발',
] as const;

// 가치관
export const VALUES = [
  '가족', '성장', '자유', '안정',
  '도전', '건강', '사랑', '성공',
  '행복', '평화', '창의성', '정의',
  '우정', '독립', '배움', '기여',
] as const;

// 스트레스 해소법
export const STRESS_RELIEF = [
  '수면', '운동', '음악 감상', '명상',
  '친구와 대화', '산책', '게임', '쇼핑',
  '맛있는 음식', '영화/드라마', '독서', '여행',
  '혼자 있기', '취미활동', '음주', '기타',
] as const;

// 프로필 수정 탭
export const PROFILE_TABS = [
  { key: 'basic', label: '기본 정보' },
  { key: 'personality', label: '성격/성향' },
  { key: 'lifestyle', label: '라이프스타일' },
  { key: 'values', label: '가치관/목표' },
] as const;

export type ProfileTabKey = typeof PROFILE_TABS[number]['key'];
