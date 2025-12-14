import React, { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { MainStackParamList } from '@/types';
import { HomeScreen } from '@/screens/HomeScreen';
import { OnboardingScreen } from '@/screens/Onboarding';
import { ProfileScreen } from '@/screens/ProfileScreen';
import { ProfileEditScreen } from '@/screens/ProfileEdit';
import { LogHistoryScreen } from '@/screens/LogHistoryScreen';
import { NotificationHistoryScreen } from '@/screens/NotificationHistoryScreen';
import { useAuthStore } from '@/stores/authStore';
import { useNotificationStore } from '@/stores/notificationStore';
import { checkProfileExists } from '@/services/profile.service';
import { AIQuestionModal } from '@/components/AIQuestionModal';
import { AIQuestion } from '@/types/database';
import {
  getTodayQuestion,
  answerQuestion,
  skipQuestion,
  getQuestionById,
} from '@/services/aiQuestion.service';

const Stack = createNativeStackNavigator<MainStackParamList>();

export const MainStack = () => {
  const { user } = useAuthStore();
  const [hasProfile, setHasProfile] = useState<boolean | null>(null);

  // 전역 AI 질문 모달 상태
  const [aiQuestion, setAiQuestion] = useState<AIQuestion | null>(null);
  const [showQuestionModal, setShowQuestionModal] = useState(false);

  const { pendingNotification, clearPendingNotification } =
    useNotificationStore();

  // 프로필 존재 여부(온보딩 여부) 확인
  useEffect(() => {
    const checkProfile = async () => {
      if (!user?.id) {
        setHasProfile(null);
        return;
      }
      const exists = await checkProfileExists(user.id);
      setHasProfile(exists);
    };

    checkProfile();
  }, [user?.id]);

  // 백그라운드 알림 클릭으로 진입한 경우 처리
  useEffect(() => {
    const handlePendingNotification = async () => {
      console.log('[MainStack] pendingNotification:', pendingNotification);
      if (!pendingNotification || !user?.id) return;

      const notificationType = pendingNotification.type as string;

      switch (notificationType) {
        case 'ai_question':
          // AI 질문 알림 → 질문 모달 띄우기
          const questionId = (pendingNotification.questionId ||
            pendingNotification.question_id) as string;

          if (questionId) {
            const question = await getQuestionById(questionId);
            console.log('[MainStack] getQuestionById 결과:', question);

            // 이미 스킵되었거나 답변된 질문은 모달 표시 안함
            if (question && !question.answer_text && !question.skipped) {
              setAiQuestion(question);
              setShowQuestionModal(true);
            }
          }
          break;

        default:
          break;
      }

      // 처리 완료 후 pending notification 클리어
      clearPendingNotification();
    };

    handlePendingNotification();
  }, [pendingNotification, user?.id, clearPendingNotification]);

  // 미답변 AI 질문 체크 (pending notification이 없을 때만, AI 질문 중복 방지)
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

  // 프로필 체크 중 로딩
  if (hasProfile === null) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#4CAF50" />
      </View>
    );
  }

  return (
    <>
      <Stack.Navigator
        screenOptions={{ headerShown: false }}
        initialRouteName={hasProfile ? 'Home' : 'Onboarding'}
      >
        <Stack.Screen name="Onboarding" component={OnboardingScreen} />
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Profile" component={ProfileScreen} />
        <Stack.Screen name="ProfileEdit" component={ProfileEditScreen} />
        <Stack.Screen name="LogHistory" component={LogHistoryScreen} />
        <Stack.Screen
          name="NotificationHistory"
          component={NotificationHistoryScreen}
        />
      </Stack.Navigator>

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
