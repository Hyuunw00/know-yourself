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
import { useAnalysisStore } from '@/stores/analysisStore';
import { getProfile } from '@/services/profile';
import { UserProfile } from '@/types';
import { ProfileEditScreen } from './ProfileEditScreen';

interface Props {
  onBack: () => void;
}

export const ProfileScreen = ({ onBack }: Props) => {
  const { user } = useAuthStore();
  const { latestAnalysis, isAnalyzing, fetchLatestAnalysis } =
    useAnalysisStore();
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
    if (user?.id) {
      fetchLatestAnalysis(user.id);
    }
  }, [fetchProfile, fetchLatestAnalysis, user?.id]);

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
    if (user?.id) {
      fetchLatestAnalysis(user.id); // 분석 결과도 다시 불러오기
    }
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
          {isAnalyzing ? (
            <View style={styles.aiCard}>
              <ActivityIndicator color="#4CAF50" />
              <Text style={styles.aiSubtext}>분석 중...</Text>
            </View>
          ) : latestAnalysis ? (
            <View style={styles.aiCard}>
              {/* 한 줄 정의 */}
              {latestAnalysis.one_liner && (
                <View style={styles.oneLinerSection}>
                  <Text style={styles.oneLiner}>
                    "{latestAnalysis.one_liner}"
                  </Text>
                </View>
              )}

              {/* 핵심 지표 */}
              <View style={styles.statsSection}>
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>
                    {latestAnalysis.analysis_number}
                  </Text>
                  <Text style={styles.statLabel}>차 분석</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>
                    {latestAnalysis.log_count}
                  </Text>
                  <Text style={styles.statLabel}>개 기록</Text>
                </View>
              </View>

              {/* AI가 발견한 키워드 */}
              {latestAnalysis.keywords &&
                latestAnalysis.keywords.length > 0 && (
                  <View style={styles.aiKeywordsSection}>
                    <View style={styles.aiKeywords}>
                      {latestAnalysis.keywords.map((keyword, index) => (
                        <View key={index} style={styles.aiKeywordTag}>
                          <Text style={styles.aiKeywordText}>#{keyword}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                )}

              {/* 강점 & 성장 포인트 (좌우 분할) */}
              <View style={styles.dualSection}>
                {latestAnalysis.strengths_analysis && (
                  <View style={styles.dualSectionLeft}>
                    <View style={styles.dualSectionHeader}>
                      <Text style={styles.dualSectionIcon}>💪</Text>
                      <Text style={styles.dualSectionTitle}>강점</Text>
                    </View>
                    <Text style={styles.dualSectionText}>
                      {latestAnalysis.strengths_analysis}
                    </Text>
                  </View>
                )}

                {latestAnalysis.growth_points && (
                  <View style={styles.dualSectionRight}>
                    <View style={styles.dualSectionHeader}>
                      <Text style={styles.dualSectionIcon}>🌱</Text>
                      <Text style={styles.dualSectionTitle}>성장점</Text>
                    </View>
                    <Text style={styles.dualSectionText}>
                      {latestAnalysis.growth_points}
                    </Text>
                  </View>
                )}
              </View>

              {/* 인사이트 */}
              {latestAnalysis.insights &&
                latestAnalysis.insights.length > 0 && (
                  <View style={styles.aiInsightsSection}>
                    <Text style={styles.insightsSectionTitle}>
                      🔮 최신 인사이트
                    </Text>
                    {latestAnalysis.insights.map((insight, index) => (
                      <View key={index} style={styles.aiInsightCard}>
                        <Text style={styles.aiInsightTitle}>
                          {insight.title}
                        </Text>
                        <Text style={styles.aiInsightContent}>
                          {insight.content}
                        </Text>
                      </View>
                    ))}
                  </View>
                )}
            </View>
          ) : (
            <View style={styles.aiCard}>
              <Text style={styles.aiPlaceholder}>📊 AI가 분석해드려요!</Text>
              <Text style={styles.aiSubtext}>
                프로필 완성 또는 기록 10개 이상 필요
              </Text>
            </View>
          )}
        </View>
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
  oneLinerSection: {
    marginBottom: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  oneLiner: {
    fontSize: 17,
    fontWeight: '600',
    color: '#1a1a1a',
    lineHeight: 26,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  aiKeywordsSection: {
    marginBottom: 16,
  },
  statsSection: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    paddingVertical: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
  },
  statItem: {
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  statNumber: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
  },
  statDivider: {
    width: 1,
    height: 32,
    backgroundColor: '#ddd',
  },
  aiSubsectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
  },
  aiKeywords: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'center',
  },
  aiKeywordTag: {
    backgroundColor: '#e8f5e9',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  aiKeywordText: {
    fontSize: 13,
    color: '#4CAF50',
    fontWeight: '600',
  },
  dualSection: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  dualSectionLeft: {
    flex: 1,
    backgroundColor: '#E8F5E9',
    padding: 16,
    borderRadius: 12,
  },
  dualSectionRight: {
    flex: 1,
    backgroundColor: '#FFF3E0',
    padding: 16,
    borderRadius: 12,
  },
  dualSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  dualSectionIcon: {
    fontSize: 18,
    marginRight: 6,
  },
  dualSectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  dualSectionText: {
    fontSize: 13,
    color: '#333',
    lineHeight: 20,
  },
  aiInsightsSection: {
    marginBottom: 16,
  },
  insightsSectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 12,
  },
  aiInsightCard: {
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  aiInsightTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  aiInsightContent: {
    fontSize: 13,
    color: '#666',
    lineHeight: 20,
  },
  aiMeta: {
    fontSize: 12,
    color: '#999',
    textAlign: 'right',
    marginTop: 8,
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
