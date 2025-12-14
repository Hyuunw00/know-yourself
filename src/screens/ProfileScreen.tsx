import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAuthStore } from '@/stores/authStore';
import { useLatestAnalysis, useRunAnalysis } from '@/queries/useAnalysis';
import { useProfile, useDeleteAccount } from '@/queries/useProfile';
import { MainStackParamList } from '@/types';
import { calculateAge, getGenderLabel } from '@/utils/profile';

type NavigationProp = NativeStackNavigationProp<MainStackParamList>;

export const ProfileScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const { user, setUser } = useAuthStore();

  // React Query - Analysis
  const { data: latestAnalysis } = useLatestAnalysis(user?.id);
  const runAnalysisMutation = useRunAnalysis();
  const isAnalyzing = runAnalysisMutation.isPending;

  // React Query - Profile
  const { data: profile, isLoading } = useProfile(user?.id);
  const deleteAccountMutation = useDeleteAccount();

  const handleDeleteAccount = () => {
    Alert.alert(
      '계정 삭제',
      '정말로 계정을 삭제하시겠습니까?\n모든 데이터가 영구적으로 삭제되며 복구할 수 없습니다.',
      [
        { text: '취소', style: 'cancel' },
        {
          text: '삭제',
          style: 'destructive',
          onPress: () => {
            if (!user?.id) return;

            deleteAccountMutation.mutate(user.id, {
              onSuccess: result => {
                if (result.success) {
                  Alert.alert('완료', '계정이 삭제되었습니다', [
                    {
                      text: '확인',
                      onPress: () => setUser(null),
                    },
                  ]);
                } else {
                  Alert.alert('오류', '계정 삭제에 실패했습니다');
                }
              },
              onError: () => {
                Alert.alert('오류', '계정 삭제에 실패했습니다');
              },
            });
          },
        },
      ],
    );
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

  const age = calculateAge(profile?.birthdate);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* 헤더 */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.backButton}>← 뒤로</Text>
          </TouchableOpacity>
          <Text style={styles.title}>내 프로필</Text>
          <TouchableOpacity onPress={() => navigation.navigate('ProfileEdit')}>
            <Text style={styles.editButton}>수정</Text>
          </TouchableOpacity>
        </View>

        {/* 기본 정보 카드 */}
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
          <Text style={styles.sectionTitle}>🤖 AI 분석 결과</Text>
          {isAnalyzing ? (
            <View style={styles.aiCard}>
              <ActivityIndicator color="#4CAF50" />
              <Text style={styles.aiSubtext}>분석 중...</Text>
            </View>
          ) : latestAnalysis ? (
            <View style={styles.aiCard}>
              {/* 한 줄 정의 - 강조 */}
              {latestAnalysis.one_liner && (
                <View style={styles.oneLinerContainer}>
                  <Text style={styles.oneLiner}>
                    "{latestAnalysis.one_liner}"
                  </Text>
                </View>
              )}

              {/* AI가 발견한 특징 */}
              {latestAnalysis.keywords &&
                latestAnalysis.keywords.length > 0 && (
                  <View style={styles.keywordsContainer}>
                    <Text style={styles.subsectionTitle}>
                      💡 AI가 발견한 나의 특징
                    </Text>
                    <View style={styles.keywords}>
                      {latestAnalysis.keywords.map((keyword, index) => (
                        <View key={index} style={styles.keywordTag}>
                          <Text style={styles.keywordText}>#{keyword}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                )}

              {/* 강점 & 약점 */}
              <View style={styles.dualSection}>
                {latestAnalysis.strengths_analysis && (
                  <View style={styles.strengthCard}>
                    <View style={styles.cardHeader}>
                      <Text style={styles.cardIcon}>💪</Text>
                      <Text style={styles.cardTitle}>강점</Text>
                    </View>
                    <Text style={styles.cardContent}>
                      {latestAnalysis.strengths_analysis}
                    </Text>
                  </View>
                )}

                {latestAnalysis.growth_points && (
                  <View style={styles.weaknessCard}>
                    <View style={styles.cardHeader}>
                      <Text style={styles.cardIcon}>🌱</Text>
                      <Text style={styles.cardTitle}>개선점</Text>
                    </View>
                    <Text style={styles.cardContent}>
                      {latestAnalysis.growth_points}
                    </Text>
                  </View>
                )}
              </View>

              {/* 감정 패턴 */}
              {latestAnalysis.emotional_patterns && (
                <View style={styles.patternCard}>
                  <View style={styles.cardHeader}>
                    <Text style={styles.cardIcon}>😊</Text>
                    <Text style={styles.cardTitle}>감정 패턴</Text>
                  </View>
                  <Text style={styles.cardContent}>
                    {latestAnalysis.emotional_patterns}
                  </Text>
                </View>
              )}

              {/* 행동 습관 */}
              {latestAnalysis.behavioral_habits && (
                <View style={styles.habitCard}>
                  <View style={styles.cardHeader}>
                    <Text style={styles.cardIcon}>🎯</Text>
                    <Text style={styles.cardTitle}>행동 습관</Text>
                  </View>
                  <Text style={styles.cardContent}>
                    {latestAnalysis.behavioral_habits}
                  </Text>
                </View>
              )}

              {/* 인사이트 */}
              {latestAnalysis.insights &&
                latestAnalysis.insights.length > 0 && (
                  <View style={styles.insightsContainer}>
                    <Text style={styles.subsectionTitle}>🔮 성장 인사이트</Text>
                    {latestAnalysis.insights.map((insight, index) => (
                      <View key={index} style={styles.insightCard}>
                        <Text style={styles.insightTitle}>{insight.title}</Text>
                        <Text style={styles.insightContent}>
                          {insight.content}
                        </Text>
                      </View>
                    ))}
                  </View>
                )}

              {/* 통계 정보 */}
              <View style={styles.statsContainer}>
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

        {/* 설정 섹션 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>⚙️ 설정</Text>
          <View style={styles.settingsCard}>
            {/* 알림 설정 */}
            <TouchableOpacity
              style={styles.settingItem}
              onPress={() => Linking.openSettings()}
            >
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>푸시 알림</Text>
                <Text style={styles.settingDescription}>
                  시스템 설정에서 알림을 관리합니다
                </Text>
              </View>
              <Text style={styles.settingArrow}>→</Text>
            </TouchableOpacity>

            {/* 구분선 */}
            <View style={styles.settingDivider} />

            {/* 개인정보 처리방침 */}
            <TouchableOpacity
              style={styles.settingItem}
              onPress={() =>
                Linking.openURL(
                  'https://hyuunw00.github.io/know-yourself/privacy-policy.html',
                )
              }
            >
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>개인정보 처리방침</Text>
                <Text style={styles.settingDescription}>
                  개인정보 수집 및 이용 안내
                </Text>
              </View>
              <Text style={styles.settingArrow}>→</Text>
            </TouchableOpacity>

            {/* 구분선 */}
            <View style={styles.settingDivider} />

            {/* 계정 삭제 */}
            <TouchableOpacity
              style={styles.settingItem}
              onPress={handleDeleteAccount}
            >
              <View style={styles.settingInfo}>
                <Text style={[styles.settingLabel, styles.dangerText]}>
                  계정 삭제
                </Text>
                <Text style={styles.settingDescription}>
                  모든 데이터가 영구적으로 삭제됩니다
                </Text>
              </View>
              <Text style={styles.dangerText}>→</Text>
            </TouchableOpacity>
          </View>
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
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginHorizontal: 16,
    marginBottom: 12,
  },
  aiCard: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  aiPlaceholder: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
    textAlign: 'center',
  },
  aiSubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
  oneLinerContainer: {
    marginBottom: 24,
    paddingBottom: 20,
    borderBottomWidth: 2,
    borderBottomColor: '#4CAF50',
  },
  oneLiner: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1a1a1a',
    lineHeight: 30,
    textAlign: 'center',
  },
  keywordsContainer: {
    marginBottom: 20,
  },
  subsectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 12,
  },
  keywords: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  keywordTag: {
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  keywordText: {
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: '600',
  },
  dualSection: {
    gap: 12,
    marginBottom: 12,
  },
  strengthCard: {
    backgroundColor: '#E8F5E9',
    padding: 16,
    borderRadius: 12,
  },
  weaknessCard: {
    backgroundColor: '#FFF3E0',
    padding: 16,
    borderRadius: 12,
  },
  patternCard: {
    backgroundColor: '#F3E5F5',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  habitCard: {
    backgroundColor: '#E3F2FD',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardIcon: {
    fontSize: 18,
    marginRight: 6,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  cardContent: {
    fontSize: 14,
    color: '#333',
    lineHeight: 22,
  },
  insightsContainer: {
    marginBottom: 20,
  },
  insightCard: {
    backgroundColor: '#f8f9fa',
    padding: 14,
    borderRadius: 10,
    marginBottom: 8,
  },
  insightTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 6,
  },
  insightContent: {
    fontSize: 13,
    color: '#666',
    lineHeight: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  statItem: {
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  statNumber: {
    fontSize: 24,
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
  settingsCard: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  settingInfo: {
    flex: 1,
    marginRight: 12,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 13,
    color: '#666',
    lineHeight: 18,
  },
  settingDivider: {
    height: 1,
    backgroundColor: '#f0f0f0',
    marginHorizontal: 16,
  },
  settingArrow: {
    fontSize: 18,
    color: '#999',
  },
  dangerText: {
    color: '#ff4444',
  },
});
