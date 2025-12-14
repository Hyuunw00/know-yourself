import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAuthStore } from '@/stores';
import {
  useLatestAnalysis,
  useRunAnalysis,
  useDailyLogs,
  useProfile,
  useUpdateProfile,
} from '@/queries';
import { isProfileComplete } from '@/utils';
import { PROFILE_TABS, ProfileTabKey } from '@/constants';
import { UserProfile, MainStackParamList } from '@/types';
import { BasicTab, PersonalityTab, LifestyleTab, ValuesTab } from './components';

type NavigationProp = NativeStackNavigationProp<MainStackParamList>;

export const ProfileEditScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const { user } = useAuthStore();
  const { data: latestAnalysis } = useLatestAnalysis(user?.id);
  const runAnalysisMutation = useRunAnalysis();
  const { data: logsData } = useDailyLogs(user?.id);
  const totalCount = logsData?.count ?? 0;

  // React Query - Profile
  const { data: profileData, isLoading } = useProfile(user?.id);
  const updateProfileMutation = useUpdateProfile();

  const [profile, setProfile] = useState<Partial<UserProfile>>({});
  const [activeTab, setActiveTab] = useState<ProfileTabKey>('basic');

  // 프로필 데이터 로드 시 로컬 상태에 복사
  useEffect(() => {
    if (profileData) {
      setProfile(profileData);
    }
  }, [profileData]);

  const handleSave = () => {
    if (!user?.id) return;

    const profileToSave = {
      name: profile.name,
      birthdate: profile.birthdate || undefined,
      gender: profile.gender || undefined,
      mbti: profile.mbti || undefined,
      occupation: profile.occupation || undefined,
      personality_keywords: profile.personality_keywords || undefined,
      strengths: profile.strengths || undefined,
      weaknesses: profile.weaknesses || undefined,
      interests: profile.interests || undefined,
      likes: profile.likes || undefined,
      dislikes: profile.dislikes || undefined,
      stress_relief: profile.stress_relief || undefined,
      values: profile.values || undefined,
      goals: profile.goals || undefined,
      bio: profile.bio || undefined,
    };

    updateProfileMutation.mutate(
      { userId: user.id, profile: profileToSave },
      {
        onSuccess: result => {
          if (!result.success) {
            Alert.alert('오류', '저장에 실패했습니다.');
            return;
          }

          // 프로필이 처음으로 완성되었고, 아직 분석이 없으면 첫 분석 실행
          const updatedProfile = {
            ...profile,
            ...profileToSave,
          } as UserProfile;

          const isNowComplete = isProfileComplete(updatedProfile);

          // 프로필이 완성되었고 아직 분석이 없으면 첫 분석 제안
          if (isNowComplete && !latestAnalysis) {
            Alert.alert(
              '프로필 완성!',
              'AI가 당신을 분석해드릴게요. 분석을 시작할까요?',
              [
                { text: '나중에', onPress: () => navigation.goBack() },
                {
                  text: '분석 시작',
                  onPress: () => {
                    navigation.goBack();
                    runAnalysisMutation.mutate({
                      userId: user.id,
                      profile: updatedProfile,
                      logCount: totalCount,
                      latestAnalysis: latestAnalysis || null,
                    });
                  },
                },
              ],
            );
          } else {
            Alert.alert('완료', '프로필이 저장되었습니다.', [
              { text: '확인', onPress: () => navigation.goBack() },
            ]);
          }
        },
        onError: () => {
          Alert.alert('오류', '저장에 실패했습니다.');
        },
      },
    );
  };

  const isSaving = updateProfileMutation.isPending;

  const renderTabContent = () => {
    switch (activeTab) {
      case 'basic':
        return <BasicTab profile={profile} setProfile={setProfile} />;
      case 'personality':
        return <PersonalityTab profile={profile} setProfile={setProfile} />;
      case 'lifestyle':
        return <LifestyleTab profile={profile} setProfile={setProfile} />;
      case 'values':
        return <ValuesTab profile={profile} setProfile={setProfile} />;
      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text>로딩 중...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* 헤더 */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>← 뒤로</Text>
        </TouchableOpacity>
        <Text style={styles.title}>프로필 수정</Text>
        <TouchableOpacity onPress={handleSave} disabled={isSaving}>
          <Text
            style={[styles.saveButton, isSaving && styles.saveButtonDisabled]}
          >
            {isSaving ? '저장중' : '저장'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* 탭 */}
      <View style={styles.tabContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {PROFILE_TABS.map(tab => (
            <TouchableOpacity
              key={tab.key}
              style={[styles.tab, activeTab === tab.key && styles.tabActive]}
              onPress={() => setActiveTab(tab.key)}
            >
              <Text
                style={[
                  styles.tabText,
                  activeTab === tab.key && styles.tabTextActive,
                ]}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* 탭 콘텐츠 */}
      <ScrollView style={styles.content}>{renderTabContent()}</ScrollView>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    backgroundColor: '#fff',
  },
  backButton: {
    fontSize: 16,
    color: '#4CAF50',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  saveButton: {
    fontSize: 16,
    color: '#4CAF50',
    fontWeight: '600',
  },
  saveButtonDisabled: {
    color: '#999',
  },
  tabContainer: {
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  tab: {
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  tabActive: {
    borderBottomWidth: 2,
    borderBottomColor: '#4CAF50',
  },
  tabText: {
    fontSize: 14,
    color: '#666',
  },
  tabTextActive: {
    color: '#4CAF50',
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: 16,
  },
});
