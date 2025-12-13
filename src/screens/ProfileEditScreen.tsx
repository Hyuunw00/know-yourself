import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import DatePicker from 'react-native-date-picker';
import { useAuthStore } from '@/stores/authStore';
import { useLatestAnalysis, useRunAnalysis } from '@/queries/useAnalysis';
import { useDailyLogCount } from '@/queries/useDailyLogs';
import { getProfile, updateProfile } from '@/services/profile';
import { MBTI_TYPES, GENDERS } from '@/constants/onboarding';
import { isProfileComplete } from '@/utils/profile';
import {
  PROFILE_TABS,
  PERSONALITY_KEYWORDS,
  INTERESTS,
  ProfileTabKey,
} from '@/constants/profile';
import { UserProfile, MainStackParamList } from '@/types';

type NavigationProp = NativeStackNavigationProp<MainStackParamList>;

export const ProfileEditScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const { user } = useAuthStore();
  const { data: latestAnalysis } = useLatestAnalysis(user?.id);
  const runAnalysisMutation = useRunAnalysis();
  const { data: totalCount = 0 } = useDailyLogCount(user?.id);
  const [profile, setProfile] = useState<Partial<UserProfile>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<ProfileTabKey>('basic');
  const [showDatePicker, setShowDatePicker] = useState(false);

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

  const handleSave = async () => {
    if (!user?.id) return;

    setIsSaving(true);

    const { success } = await updateProfile(user.id, {
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
    });

    setIsSaving(false);

    if (!success) {
      Alert.alert('오류', '저장에 실패했습니다.');
      return;
    }

    // 프로필이 처음으로 완성되었고, 아직 분석이 없으면 첫 분석 실행
    const updatedProfile = {
      ...profile,
      name: profile.name,
      birthdate: profile.birthdate,
      gender: profile.gender,
      mbti: profile.mbti,
      occupation: profile.occupation,
      personality_keywords: profile.personality_keywords,
      strengths: profile.strengths,
      weaknesses: profile.weaknesses,
      interests: profile.interests,
      values: profile.values,
      goals: profile.goals,
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
              // 백그라운드로 분석 실행
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
  };

  // 배열 필드 토글 (복수 선택)
  const toggleArrayField = (field: keyof UserProfile, value: string) => {
    const current = (profile[field] as string[]) || [];
    const updated = current.includes(value)
      ? current.filter(v => v !== value)
      : [...current, value];
    setProfile({ ...profile, [field]: updated });
  };

  // 커스텀 값 추가
  const [customInputs, setCustomInputs] = useState<Record<string, string>>({});

  const handleAddCustomValue = (field: keyof UserProfile) => {
    const value = customInputs[field]?.trim();
    if (!value) return;

    const current = (profile[field] as string[]) || [];
    if (!current.includes(value)) {
      setProfile({ ...profile, [field]: [...current, value] });
    }
    setCustomInputs({ ...customInputs, [field]: '' });
  };

  // 복수 선택 칩 렌더링 (커스텀 입력 포함)
  const renderChips = (
    options: readonly string[],
    field: keyof UserProfile,
    placeholder: string = '직접 입력',
  ) => {
    const selected = (profile[field] as string[]) || [];
    // 기본 옵션에 없는 커스텀 값들
    const customValues = selected.filter(v => !options.includes(v));

    return (
      <View>
        <View style={styles.chipContainer}>
          {options.map(option => (
            <TouchableOpacity
              key={option}
              style={[
                styles.chip,
                selected.includes(option) && styles.chipSelected,
              ]}
              onPress={() => toggleArrayField(field, option)}
            >
              <Text
                style={[
                  styles.chipText,
                  selected.includes(option) && styles.chipTextSelected,
                ]}
              >
                {option}
              </Text>
            </TouchableOpacity>
          ))}
          {/* 커스텀 값 칩들 */}
          {customValues.map(value => (
            <TouchableOpacity
              key={value}
              style={[styles.chip, styles.chipSelected, styles.chipCustom]}
              onPress={() => toggleArrayField(field, value)}
            >
              <Text style={[styles.chipText, styles.chipTextSelected]}>
                {value} ✕
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        {/* 직접 입력 필드 */}
        <View style={styles.customInputRow}>
          <TextInput
            style={styles.customInput}
            value={customInputs[field] || ''}
            onChangeText={text =>
              setCustomInputs({ ...customInputs, [field]: text })
            }
            placeholder={placeholder}
            placeholderTextColor="#999"
            onSubmitEditing={() => handleAddCustomValue(field)}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="default"
          />
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => handleAddCustomValue(field)}
          >
            <Text style={styles.addButtonText}>추가</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  // 기본 정보 탭
  const renderBasicTab = () => (
    <>
      <View style={styles.section}>
        <Text style={styles.label}>이름</Text>
        <TextInput
          style={styles.input}
          value={profile.name || ''}
          onChangeText={text => setProfile({ ...profile, name: text })}
          placeholder="이름 또는 닉네임"
          placeholderTextColor="#999"
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>생년월일</Text>
        <TouchableOpacity
          style={styles.datePickerButton}
          onPress={() => setShowDatePicker(true)}
        >
          <Text
            style={profile.birthdate ? styles.dateText : styles.datePlaceholder}
          >
            {profile.birthdate
              ? new Date(profile.birthdate).toLocaleDateString('ko-KR', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })
              : '생년월일 선택'}
          </Text>
        </TouchableOpacity>
        <DatePicker
          modal
          open={showDatePicker}
          date={
            profile.birthdate
              ? new Date(profile.birthdate)
              : new Date(1990, 0, 1)
          }
          mode="date"
          maximumDate={new Date()}
          minimumDate={new Date(1900, 0, 1)}
          onConfirm={selectedDate => {
            setShowDatePicker(false);
            const formattedDate = selectedDate.toISOString().split('T')[0];
            setProfile({ ...profile, birthdate: formattedDate });
          }}
          onCancel={() => setShowDatePicker(false)}
          title="생년월일 선택"
          confirmText="확인"
          cancelText="취소"
          locale="ko"
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>성별</Text>
        <View style={styles.optionRow}>
          {GENDERS.map(g => (
            <TouchableOpacity
              key={g.value}
              style={[
                styles.optionButton,
                profile.gender === g.value && styles.optionSelected,
              ]}
              onPress={() => setProfile({ ...profile, gender: g.value })}
            >
              <Text
                style={[
                  styles.optionText,
                  profile.gender === g.value && styles.optionTextSelected,
                ]}
              >
                {g.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>MBTI</Text>
        <View style={styles.mbtiContainer}>
          {MBTI_TYPES.map(type => (
            <TouchableOpacity
              key={type}
              style={[
                styles.mbtiButton,
                profile.mbti === type && styles.mbtiSelected,
              ]}
              onPress={() => setProfile({ ...profile, mbti: type })}
            >
              <Text
                style={[
                  styles.mbtiText,
                  profile.mbti === type && styles.mbtiTextSelected,
                ]}
              >
                {type}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>직업</Text>
        <TextInput
          style={styles.input}
          value={profile.occupation || ''}
          onChangeText={text => setProfile({ ...profile, occupation: text })}
          placeholder="예: 학생, 개발자, 디자이너"
          placeholderTextColor="#999"
        />
      </View>
    </>
  );

  // 성격/성향 탭
  const renderPersonalityTab = () => (
    <>
      <View style={styles.section}>
        <Text style={styles.label}>나를 표현하는 키워드</Text>
        <Text style={styles.hint}>여러 개 선택 가능</Text>
        {renderChips(PERSONALITY_KEYWORDS, 'personality_keywords')}
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>나의 장점</Text>
        <TextInput
          style={styles.textArea}
          value={profile.strengths || ''}
          onChangeText={text => setProfile({ ...profile, strengths: text })}
          placeholder="예: 책임감이 강해서 맡은 일은 끝까지 해내는 편이에요. 친구들이 저를 믿고 의지하는 이유인 것 같아요."
          placeholderTextColor="#999"
          multiline
        />
        <Text style={styles.hint}>자유롭게 서술해주세요</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>개선하고 싶은 점</Text>
        <TextInput
          style={styles.textArea}
          value={profile.weaknesses || ''}
          onChangeText={text => setProfile({ ...profile, weaknesses: text })}
          placeholder="예: 결정을 내릴 때 우유부단해서 기회를 놓칠 때가 많아요. 빨리 판단하고 실행하는 능력을 키우고 싶어요."
          placeholderTextColor="#999"
          multiline
        />
        <Text style={styles.hint}>자유롭게 서술해주세요</Text>
      </View>
    </>
  );

  // ���이프스타일 탭
  const renderLifestyleTab = () => (
    <>
      <View style={styles.section}>
        <Text style={styles.label}>관심사/취미</Text>
        {renderChips(INTERESTS, 'interests')}
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>좋아하는 것</Text>
        <TextInput
          style={styles.textArea}
          value={profile.likes || ''}
          onChangeText={text => setProfile({ ...profile, likes: text })}
          placeholder="예: 커피 마시면서 책 읽는 시간, 비 오는 날 창밖 바라보기, 새벽의 고요한 분위기"
          placeholderTextColor="#999"
          multiline
        />
        <Text style={styles.hint}>자유롭게 서술해주세요</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>싫어하는 것</Text>
        <TextInput
          style={styles.textArea}
          value={profile.dislikes || ''}
          onChangeText={text => setProfile({ ...profile, dislikes: text })}
          placeholder="예: 거짓말하는 사람, 무더운 여름 날씨, 복잡한 인파 속에 있을 때"
          placeholderTextColor="#999"
          multiline
        />
        <Text style={styles.hint}>자유롭게 서술해주세요</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>스트레스 해소법</Text>
        <TextInput
          style={styles.textArea}
          value={profile.stress_relief || ''}
          onChangeText={text => setProfile({ ...profile, stress_relief: text })}
          placeholder="예: 운동하기, 음악 듣기, 친구들과 수다 떨기 등으로 스트레스를 풀어요."
          placeholderTextColor="#999"
          multiline
        />
        <Text style={styles.hint}>자유롭게 서술해주세요</Text>
      </View>
    </>
  );

  // 가치관/목표 탭
  const renderValuesTab = () => (
    <>
      <View style={styles.section}>
        <Text style={styles.label}>중요하게 생각하는 가치</Text>
        <TextInput
          style={styles.textArea}
          value={profile.values || ''}
          onChangeText={text => setProfile({ ...profile, values: text })}
          placeholder="예: 가족과의 시간, 자기계발, 일과 삶의 균형을 가장 중요하게 생각해요."
          placeholderTextColor="#999"
          multiline
        />
        <Text style={styles.hint}>자유롭게 서술해주세요</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>인생 목표</Text>
        <TextInput
          style={styles.textArea}
          value={profile.goals || ''}
          onChangeText={text => setProfile({ ...profile, goals: text })}
          placeholder="예: 30대에 경제적 자유를 이루고, 하고 싶은 일을 선택해서 할 수 있는 삶을 살고 싶어요."
          placeholderTextColor="#999"
          multiline
        />
        <Text style={styles.hint}>자유롭게 서술해주세요</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>자기소개 한 줄</Text>
        <TextInput
          style={styles.textArea}
          value={profile.bio || ''}
          onChangeText={text => setProfile({ ...profile, bio: text })}
          placeholder="나를 한 문장으로 표현한다면?"
          placeholderTextColor="#999"
          multiline
        />
      </View>
    </>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'basic':
        return renderBasicTab();
      case 'personality':
        return renderPersonalityTab();
      case 'lifestyle':
        return renderLifestyleTab();
      case 'values':
        return renderValuesTab();
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
  section: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  hint: {
    fontSize: 12,
    color: '#999',
    marginBottom: 8,
  },
  datePickerButton: {
    backgroundColor: '#fff',
    padding: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  dateText: {
    fontSize: 16,
    color: '#1a1a1a',
  },
  datePlaceholder: {
    fontSize: 16,
    color: '#999',
  },
  input: {
    backgroundColor: '#fff',
    padding: 14,
    borderRadius: 10,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  textArea: {
    backgroundColor: '#fff',
    padding: 14,
    borderRadius: 10,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    minHeight: 80,
    textAlignVertical: 'top',
  },
  optionRow: {
    flexDirection: 'row',
    gap: 10,
  },
  optionButton: {
    flex: 1,
    padding: 12,
    borderRadius: 10,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    alignItems: 'center',
  },
  optionSelected: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  optionText: {
    fontSize: 14,
    color: '#333',
  },
  optionTextSelected: {
    color: '#fff',
    fontWeight: '600',
  },
  mbtiContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  mbtiButton: {
    width: '22%',
    padding: 10,
    borderRadius: 8,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    alignItems: 'center',
  },
  mbtiSelected: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  mbtiText: {
    fontSize: 12,
    color: '#333',
  },
  mbtiTextSelected: {
    color: '#fff',
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  chipSelected: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  chipText: {
    fontSize: 14,
    color: '#333',
  },
  chipTextSelected: {
    color: '#fff',
  },
  chipCustom: {
    backgroundColor: '#2196F3',
    borderColor: '#2196F3',
  },
  customInputRow: {
    flexDirection: 'row',
    marginTop: 10,
    gap: 8,
  },
  customInput: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 10,
    fontSize: 14,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  addButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 16,
    borderRadius: 10,
    justifyContent: 'center',
  },
  addButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});
