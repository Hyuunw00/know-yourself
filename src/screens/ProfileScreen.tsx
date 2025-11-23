import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '@/stores/authStore';
import { getProfile } from '@/services/profile';
import { UserProfile } from '@/types';
import { ProfileEditScreen } from './ProfileEditScreen';

interface Props {
  onBack: () => void;
}

export const ProfileScreen = ({ onBack }: Props) => {
  const { user } = useAuthStore();
  const [profile, setProfile] = useState<Partial<UserProfile> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);

  const fetchProfile = useCallback(async () => {
    if (!user?.id) return;

    const data = await getProfile(user.id);
    if (data) {
      setProfile(data);
    }
    setIsLoading(false);
  }, [user?.id]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const getGenderLabel = (gender?: string) => {
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

  const calculateAge = (birthdate?: string) => {
    if (!birthdate) return null;
    const birth = new Date(birthdate);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birth.getDate())
    ) {
      age--;
    }
    return age;
  };

  const handleEditComplete = () => {
    setIsEditing(false);
    fetchProfile(); // 수정 후 프로필 다시 불러오기
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4CAF50" />
        </View>
      </SafeAreaView>
    );
  }

  // 수정 모드일 때
  if (isEditing) {
    return <ProfileEditScreen onBack={handleEditComplete} />;
  }

  const age = calculateAge(profile?.birthdate);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* 헤더 */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onBack}>
            <Text style={styles.backButton}>← 뒤로</Text>
          </TouchableOpacity>
          <Text style={styles.title}>내 프로필</Text>
          <TouchableOpacity onPress={() => setIsEditing(true)}>
            <Text style={styles.editButton}>수정</Text>
          </TouchableOpacity>
        </View>

        {/* 프로필 요약 카드 */}
        <View style={styles.profileCard}>
          <Text style={styles.profileName}>{profile?.name || '이름 없음'}</Text>
          <View style={styles.profileTags}>
            {profile?.mbti && (
              <View style={styles.tag}>
                <Text style={styles.tagText}>{profile.mbti}</Text>
              </View>
            )}
            {age && (
              <View style={styles.tag}>
                <Text style={styles.tagText}>{age}세</Text>
              </View>
            )}
            {profile?.gender && (
              <View style={styles.tag}>
                <Text style={styles.tagText}>
                  {getGenderLabel(profile.gender)}
                </Text>
              </View>
            )}
          </View>
          {profile?.occupation && (
            <Text style={styles.profileOccupation}>{profile.occupation}</Text>
          )}
        </View>

        {/* AI 분석 결과 섹션 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>AI 분석 결과</Text>
          <View style={styles.aiCard}>
            <Text style={styles.aiPlaceholder}>
              📊 일기를 더 작성하면 AI가 분석해드려요!
            </Text>
            <Text style={styles.aiSubtext}>
              최소 7일 이상의 기록이 필요합니다.
            </Text>
          </View>
        </View>

        {/* 내 정보 섹션 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>내 정보</Text>
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>이름</Text>
              <Text style={styles.infoValue}>{profile?.name || '-'}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>생년월일</Text>
              <Text style={styles.infoValue}>{profile?.birthdate || '-'}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>성별</Text>
              <Text style={styles.infoValue}>
                {getGenderLabel(profile?.gender)}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>MBTI</Text>
              <Text style={styles.infoValue}>{profile?.mbti || '-'}</Text>
            </View>
            <View style={[styles.infoRow, { borderBottomWidth: 0 }]}>
              <Text style={styles.infoLabel}>직업</Text>
              <Text style={styles.infoValue}>{profile?.occupation || '-'}</Text>
            </View>
          </View>
        </View>

        {/* 수정 버튼 */}
        <TouchableOpacity
          style={styles.editFullButton}
          onPress={() => setIsEditing(true)}
        >
          <Text style={styles.editFullButtonText}>프로필 수정하기</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingBottom: 10,
  },
  backButton: {
    fontSize: 16,
    color: '#4CAF50',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  editButton: {
    fontSize: 16,
    color: '#4CAF50',
  },
  profileCard: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  profileName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 12,
  },
  profileTags: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  tag: {
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  tagText: {
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: '500',
  },
  profileOccupation: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginHorizontal: 16,
    marginBottom: 12,
  },
  aiCard: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    padding: 24,
    borderRadius: 12,
    alignItems: 'center',
  },
  aiPlaceholder: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
  },
  aiSubtext: {
    fontSize: 14,
    color: '#999',
  },
  infoCard: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    borderRadius: 12,
    overflow: 'hidden',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  infoLabel: {
    fontSize: 14,
    color: '#666',
  },
  infoValue: {
    fontSize: 14,
    color: '#1a1a1a',
    fontWeight: '500',
  },
  editFullButton: {
    backgroundColor: '#4CAF50',
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 40,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  editFullButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
