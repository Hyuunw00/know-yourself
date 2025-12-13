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
