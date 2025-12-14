import { UserProfile } from '@/types';

// 프로필이 완전히 채워졌는지 체크
export const isProfileComplete = (profile: UserProfile): boolean => {
  return !!(
    profile.name &&
    profile.birthdate &&
    profile.gender &&
    profile.mbti &&
    profile.occupation &&
    profile.personality_keywords?.length &&
    profile.strengths?.trim() &&
    profile.weaknesses?.trim() &&
    profile.interests?.length &&
    profile.likes?.trim() &&
    profile.dislikes?.trim() &&
    profile.stress_relief?.trim() &&
    profile.values?.trim() &&
    profile.goals?.trim() &&
    profile.bio?.trim()
  );
};

export const getGenderLabel = (gender?: string) => {
  switch (gender) {
    case 'male':
      return '남성';
    case 'female':
      return '여성';
    case 'other':
      return '기타';
    default:
      return '미입력';
  }
};

export const calculateAge = (birthdate?: string) => {
  if (!birthdate) return null;
  const birth = new Date(birthdate);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
};
