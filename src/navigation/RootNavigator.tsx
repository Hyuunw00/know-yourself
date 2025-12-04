import React, { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from '@/types';
import { HomeScreen } from '@/screens/HomeScreen';
import { AuthScreen } from '@/screens/AuthScreen';
import { OnboardingScreen } from '@/screens/OnboardingScreen';
import { ProfileScreen } from '@/screens/ProfileScreen';
import { ProfileEditScreen } from '@/screens/ProfileEditScreen';
import { useAuthStore } from '@/stores/authStore';
import { useNotificationStore } from '@/stores/notificationStore';
import { supabase } from '@/services/supabase';
import { AIQuestionModal } from '@/components/AIQuestionModal';
import { AIQuestion } from '@/types/database';
import {
  getTodayQuestion,
  answerQuestion,
  skipQuestion,
} from '@/services/aiQuestion';

const Stack = createNativeStackNavigator<RootStackParamList>();

export const RootNavigator = () => {
  const { user, isInitialized, initialize } = useAuthStore();
  const [hasProfile, setHasProfile] = useState<boolean | null>(null);
  const [showProfile, setShowProfile] = useState(false);
  const [showProfileEdit, setShowProfileEdit] = useState(false);

  // 전역 AI 질문 모달 상태
  const [aiQuestion, setAiQuestion] = useState<AIQuestion | null>(null);
  const [showQuestionModal, setShowQuestionModal] = useState(false);

  const { pendingNotification, clearPendingNotification } =
    useNotificationStore();

  // 앱 시작 시 인증 상태 확인
  useEffect(() => {
    initialize();
  }, [initialize]);

  // 프로필 존재 여부 확인
  useEffect(() => {
    const checkProfile = async () => {
      if (!user?.id) {
        setHasProfile(null);
        return;
      }

      const { data } = await supabase
        .from('user_profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      setHasProfile(!!data);
    };

    checkProfile();
  }, [user?.id]);

  // 백그라운드 알림 클릭으로 진입한 경우 처리
  useEffect(() => {
    const handlePendingNotification = async () => {
      if (!pendingNotification || !user?.id) return;

      const notificationType = pendingNotification.type as string;

      switch (notificationType) {
        case 'ai_question':
          // AI 질문 알림 → 질문 모달 띄우기
          const questionId = (pendingNotification.questionId ||
            pendingNotification.question_id) as string;

          if (questionId) {
            const { getQuestionById } = await import('@/services/aiQuestion');
            const question = await getQuestionById(questionId);

            if (question) {
              setAiQuestion(question);
              setShowQuestionModal(true);
            }
          }
          break;

        case 'analysis_complete':
          // AI 분석 완료 알림 → 프로필 페이지로 이동
          setShowProfile(true);
          break;

        default:
          break;
      }

      // 처리 완료 후 pending notification 클리어
      clearPendingNotification();
    };

    handlePendingNotification();
  }, [pendingNotification, user?.id, clearPendingNotification]);

  // 미답변 AI 질문 체크 (pending notification이 없을 때만)
  useEffect(() => {
    const checkPendingQuestion = async () => {
      if (!user?.id || !hasProfile || pendingNotification) {
        return;
      }

      const question = await getTodayQuestion(user.id);
      if (question && !question.answer_text) {
        setAiQuestion(question);
        setShowQuestionModal(true);
      }
    };

    checkPendingQuestion();
  }, [user?.id, hasProfile, pendingNotification]);

  // AI 질문 답변 처리
  const handleAnswerQuestion = async (answer: string) => {
    if (!aiQuestion) return;

    const success = await answerQuestion(aiQuestion.id, answer);
    if (success) {
      setShowQuestionModal(false);
      setAiQuestion(null);
    }
  };

  // AI 질문 답변 안하기 (질문 스킵)
  const handleSkipQuestion = async () => {
    if (!aiQuestion) return;

    const success = await skipQuestion(aiQuestion.id);
    if (success) {
      setShowQuestionModal(false);
      setAiQuestion(null);
    }
  };

  // 초기화 중 로딩
  if (!isInitialized || (user && hasProfile === null)) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#4CAF50" />
      </View>
    );
  }

  return (
    <>
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          {!user || !user.email_confirmed_at ? (
            // 비로그인 상태 또는 이메일 미인증
            <Stack.Screen name="Auth" component={AuthScreen} />
          ) : !hasProfile ? (
            // 로그인 + 이메일 인증 완료 + 프로필 없음 → 온보딩
            <Stack.Screen name="Onboarding">
              {() => (
                <OnboardingScreen
                  onComplete={() => setHasProfile(true)}
                  onGoProfile={() => {
                    setHasProfile(true);
                    setShowProfileEdit(true);
                  }}
                />
              )}
            </Stack.Screen>
          ) : showProfileEdit ? (
            // 프로필 수정 화면
            <Stack.Screen name="ProfileEdit">
              {() => (
                <ProfileEditScreen
                  onBack={() => {
                    setShowProfileEdit(false);
                    setShowProfile(false);
                  }}
                />
              )}
            </Stack.Screen>
          ) : showProfile ? (
            // 프로필 화면
            <Stack.Screen name="Profile">
              {() => <ProfileScreen onBack={() => setShowProfile(false)} />}
            </Stack.Screen>
          ) : (
            // 로그인 + 이메일 인증 + 프로필 있음 → 홈
            <Stack.Screen name="Home">
              {() => <HomeScreen onGoProfile={() => setShowProfile(true)} />}
            </Stack.Screen>
          )}
        </Stack.Navigator>
      </NavigationContainer>

      {/* 전역 AI 질문 모달 */}
      {aiQuestion && (
        <AIQuestionModal
          visible={showQuestionModal}
          questionText={aiQuestion.question_text}
          onAnswer={handleAnswerQuestion}
          onSkip={handleSkipQuestion}
        />
      )}
    </>
  );
};
