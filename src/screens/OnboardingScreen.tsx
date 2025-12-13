import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CommonActions, useNavigation } from '@react-navigation/native';
import { supabase } from '@/database/supabase';
import { useAuthStore } from '@/stores/authStore';
import {
  NameStep,
  BirthdateStep,
  GenderStep,
  MBTIStep,
  CompleteStep,
} from '@/components/onboarding';

export const OnboardingScreen = () => {
  const navigation = useNavigation();
  const [step, setStep] = useState(0);
  const [name, setName] = useState('');
  const [birthdate, setBirthdate] = useState('');
  const [gender, setGender] = useState<string | null>(null);
  const [mbti, setMbti] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuthStore();

  const handleNext = async () => {
    if (step === 0 && !name.trim()) {
      Alert.alert('알림', '이름을 입력해주세요.');
      return;
    }

    if (step === 3) {
      await saveProfile();
      return;
    }

    setStep(step + 1);
  };

  const handleBack = () => {
    setStep(step - 1);
  };

  const saveProfile = async () => {
    if (!user?.id) return;

    setIsLoading(true);

    const { error } = await supabase.from('user_profiles').insert({
      user_id: user.id,
      name: name.trim(),
      birthdate: birthdate || null,
      gender: gender || null,
      mbti: mbti || null,
    });

    setIsLoading(false);

    if (error) {
      Alert.alert('오류', '프로필 저장에 실패했습니다.');
      console.error(error);
      return;
    }

    setStep(4);
  };

  // 온보딩 완료 후 Home으로 이동 (스택 초기화)
  const navigateToHome = () => {
    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name: 'Home' }],
      }),
    );
  };

  // 프로필 수정 페이지로 이동
  const navigateToProfile = () => {
    navigation.dispatch(
      CommonActions.reset({
        index: 1,
        routes: [{ name: 'Home' }, { name: 'ProfileEdit' }],
      }),
    );
  };

  const renderStepContent = () => {
    switch (step) {
      case 0:
        return <NameStep name={name} onNameChange={setName} />;
      case 1:
        return <BirthdateStep birthdate={birthdate} onBirthdateChange={setBirthdate} />;
      case 2:
        return <GenderStep gender={gender} onGenderChange={setGender} />;
      case 3:
        return <MBTIStep mbti={mbti} onMBTIChange={setMbti} />;
      case 4:
        return (
          <CompleteStep
            name={name}
            onGoHome={navigateToHome}
            onGoProfile={navigateToProfile}
          />
        );
      default:
        return null;
    }
  };

  const getHeaderContent = () => {
    switch (step) {
      case 0:
        return { title: '반가워요! 👋', subtitle: '시작하기 전에 간단히 알려주세요' };
      case 1:
        return { title: '조금 더 알려주세요', subtitle: '생략해도 괜찮아요' };
      case 2:
        return { title: '거의 다 왔어요', subtitle: '생략해도 괜찮아요' };
      case 3:
        return { title: '마지막이에요!', subtitle: 'AI 분석에 도움이 돼요' };
      default:
        return null;
    }
  };

  const isNextDisabled = step === 0 && !name.trim();
  const headerContent = getHeaderContent();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* 진행 표시 (완료 화면 제외) */}
        {step < 4 && (
          <View style={styles.progressContainer}>
            {Array.from({ length: 4 }).map((_, i) => (
              <View
                key={i}
                style={[
                  styles.progressDot,
                  i <= step && styles.progressDotActive,
                ]}
              />
            ))}
          </View>
        )}

        {/* 헤더 (완료 화면 제외) */}
        {headerContent && (
          <View style={styles.header}>
            <Text style={styles.title}>{headerContent.title}</Text>
            <Text style={styles.subtitle}>{headerContent.subtitle}</Text>
          </View>
        )}

        {/* 스텝별 내용 */}
        {renderStepContent()}

        {/* 버튼 영역 (완료 화면 제외) */}
        {step < 4 && (
          <>
            <View style={styles.buttonContainer}>
              {step > 0 && (
                <TouchableOpacity style={styles.backButton} onPress={handleBack}>
                  <Text style={styles.backButtonText}>이전</Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity
                style={[
                  styles.nextButton,
                  isNextDisabled && styles.buttonDisabled,
                  step === 0 && styles.fullWidthButton,
                ]}
                onPress={handleNext}
                disabled={isNextDisabled || isLoading}>
                <Text style={styles.nextButtonText}>
                  {isLoading ? '저장 중...' : step === 3 ? '완료' : '다음'}
                </Text>
              </TouchableOpacity>
            </View>

            {/* 스킵 버튼 (1~2 단계만) */}
            {step > 0 && step < 3 && (
              <TouchableOpacity onPress={handleNext}>
                <Text style={styles.skipStepText}>건너뛰기</Text>
              </TouchableOpacity>
            )}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 30,
    gap: 8,
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ddd',
  },
  progressDotActive: {
    backgroundColor: '#4CAF50',
  },
  header: {
    marginBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  backButton: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 18,
    color: '#666',
  },
  nextButton: {
    flex: 2,
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#4CAF50',
    alignItems: 'center',
  },
  fullWidthButton: {
    flex: 1,
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  nextButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  skipStepText: {
    marginTop: 16,
    textAlign: 'center',
    color: '#999',
    fontSize: 14,
  },
});
