import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { DailyLogModal } from '@/components/DailyLogModal';
import { LogHistoryScreen } from '@/screens/LogHistoryScreen';
import { NotificationHistoryScreen } from '@/screens/NotificationHistoryScreen';
import { ActivityGrass } from '@/components/ActivityGrass';
import { useDailyLogStore } from '@/stores/dailyLogStore';
import { useAuthStore } from '@/stores/authStore';
import { useAnalysisStore, ANALYSIS_INTERVAL } from '@/stores/analysisStore';
import { getProfile, updateLastAppOpenAt } from '@/services/profile';
import { DailyLog, UserProfile, AIQuestion } from '@/types/database';
import { formatDateShort } from '@/utils/date';
import { getTodayQuestion } from '@/services/aiQuestion';
import { AIQuestionModal } from '@/components/AIQuestionModal';
import { getUnreadCount } from '@/services/notification';

interface Props {
  onGoProfile?: () => void;
}

export const HomeScreen = ({ onGoProfile }: Props) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedLog, setSelectedLog] = useState<DailyLog | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [aiQuestion, setAiQuestion] = useState<AIQuestion | null>(null);
  const [showQuestionModal, setShowQuestionModal] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const {
    logs,
    totalCount,
    isLoading,
    fetchLogs,
    addLog,
    updateLog,
    deleteLog,
  } = useDailyLogStore();
  const { user, logout } = useAuthStore();
  const { checkAndTriggerAnalysis } = useAnalysisStore();

  const loadUnreadCount = async () => {
    if (!user?.id) return;
    const count = await getUnreadCount(user.id);
    setUnreadCount(count);
  };

  useEffect(() => {
    if (user?.id) {
      fetchLogs(user.id);
      getProfile(user.id).then(setProfile);
      updateLastAppOpenAt(user.id);
      loadUnreadCount();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchLogs, user?.id]);

  // AI 질문 체크 로직
  useEffect(() => {
    const showPendingQuestion = async () => {
      if (!user?.id) return;

      const question = await getTodayQuestion(user.id);

      if (question && !question.answer_text) {
        setAiQuestion(question);
        setShowQuestionModal(true);
      }
    };

    if (user?.id && !isLoading) {
      showPendingQuestion();
    }
  }, [user?.id, isLoading]);

  const handleSaveLog = async (text: string) => {
    if (!user?.id) return;

    // 오늘 작성한 기록 개수 확인 (제한: 3개)
    const { getTodayLogCount } = await import('@/services/dailyLog');
    const todayCount = await getTodayLogCount(user.id);

    if (todayCount >= 3) {
      Alert.alert(
        '기록 제한',
        '하루에 최대 3개까지 기록할 수 있어요.\n내일 다시 작성해주세요!',
        [{ text: '확인' }],
      );
      return;
    }

    const success = await addLog(user.id, text);
    if (success) {
      setModalVisible(false);
      if (profile) {
        const newTotalCount = totalCount + 1;
        // ANALYSIS_INTERVAL의 배수일 때 백그라운드 분석 트리거
        if (
          newTotalCount >= ANALYSIS_INTERVAL &&
          newTotalCount % ANALYSIS_INTERVAL === 0
        ) {
          checkAndTriggerAnalysis(user.id, profile, newTotalCount);
        }
      }
    }
  };

  const handleLogPress = (log: DailyLog) => {
    setSelectedLog(log);
    setModalVisible(true);
  };

  const handleUpdateLog = async (logId: string, text: string) => {
    await updateLog(logId, text);
    setSelectedLog(null);
    setModalVisible(false);
  };

  const handleDeleteLog = async (logId: string) => {
    await deleteLog(logId);
    setSelectedLog(null);
    setModalVisible(false);
  };

  const handleCloseModal = () => {
    setSelectedLog(null);
    setModalVisible(false);
  };

  const handleAnswerQuestion = async (answer: string) => {
    if (!aiQuestion) return;

    const { answerQuestion } = await import('@/services/aiQuestion');
    const success = await answerQuestion(aiQuestion.id, answer);

    if (success) {
      setShowQuestionModal(false);
      setAiQuestion(null);
    }
  };

  const handleSkipQuestion = () => {
    setShowQuestionModal(false);
    setAiQuestion(null);
  };

  // 텍스트 미리보기 (30자 제한)
  const getPreview = (text: string) => {
    return text.length > 30 ? text.slice(0, 30) + '...' : text;
  };

  if (showHistory) {
    return <LogHistoryScreen onBack={() => setShowHistory(false)} />;
  }

  if (showNotifications) {
    return (
      <NotificationHistoryScreen
        onBack={() => {
          setShowNotifications(false);
          loadUnreadCount();
        }}
      />
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* 헤더 */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <Text style={styles.title}>나의 기록</Text>
            <View style={styles.headerButtons}>
              {/* 알림 아이콘 */}
              <TouchableOpacity
                onPress={() => setShowNotifications(true)}
                style={styles.notificationButton}
              >
                <Text style={styles.notificationIcon}>🔔</Text>
                {unreadCount > 0 && (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>
                      {unreadCount > 99 ? '99+' : unreadCount}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
              {onGoProfile && (
                <TouchableOpacity
                  onPress={onGoProfile}
                  style={styles.headerButton}
                >
                  <Text style={styles.headerButtonText}>프로필</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity onPress={logout} style={styles.headerButton}>
                <Text style={styles.logoutText}>로그아웃</Text>
              </TouchableOpacity>
            </View>
          </View>
          <Text style={styles.subtitle}>매일 기록하며 나를 알아가요</Text>
        </View>

        {/* 잔디 UI */}
        <View style={styles.activitySection}>
          <Text style={styles.sectionTitle}>기록 현황</Text>
          <ActivityGrass logs={logs} />
        </View>

        {/* 오늘 기록하기 버튼 */}
        <TouchableOpacity
          style={styles.mainButton}
          onPress={() => setModalVisible(true)}
        >
          <Text style={styles.mainButtonText}>✍️ 오늘 기록하기</Text>
        </TouchableOpacity>

        {/* 최근 기록 */}
        <View style={styles.recentSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>최근 기록</Text>
            {logs.length > 0 && (
              <TouchableOpacity onPress={() => setShowHistory(true)}>
                <Text style={styles.moreButton}>더보기</Text>
              </TouchableOpacity>
            )}
          </View>
          {isLoading ? (
            <ActivityIndicator color="#4CAF50" />
          ) : logs.length === 0 ? (
            <Text style={styles.emptyText}>아직 기록이 없어요</Text>
          ) : (
            logs.map(log => (
              <TouchableOpacity
                key={log.id}
                style={styles.logItem}
                onPress={() => handleLogPress(log)}
              >
                <Text style={styles.logDate}>{formatDateShort(log.date)}</Text>
                <Text style={styles.logPreview}>{getPreview(log.text)}</Text>
                <Text style={styles.arrow}>›</Text>
              </TouchableOpacity>
            ))
          )}
        </View>
      </ScrollView>

      {/* 기록 작성/수정 모달 */}
      <DailyLogModal
        visible={modalVisible}
        onClose={handleCloseModal}
        onSave={selectedLog ? undefined : handleSaveLog}
        onUpdate={selectedLog ? handleUpdateLog : undefined}
        onDelete={selectedLog ? handleDeleteLog : undefined}
        log={selectedLog}
      />

      {/* AI 질문 모달 */}
      {aiQuestion && (
        <AIQuestionModal
          visible={showQuestionModal}
          questionText={aiQuestion.question_text}
          onAnswer={handleAnswerQuestion}
          onSkip={handleSkipQuestion}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: 20,
    paddingTop: 10,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  headerButtons: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  notificationButton: {
    position: 'relative',
    paddingVertical: 4,
  },
  notificationIcon: {
    fontSize: 20,
  },
  badge: {
    position: 'absolute',
    top: 0,
    right: -6,
    backgroundColor: '#FF3B30',
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  headerButton: {
    paddingVertical: 4,
  },
  headerButtonText: {
    fontSize: 14,
    color: '#4CAF50',
  },
  logoutText: {
    fontSize: 14,
    color: '#999',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
  },
  activitySection: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  moreButton: {
    fontSize: 14,
    color: '#4CAF50',
  },
  mainButton: {
    backgroundColor: '#4CAF50',
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  mainButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  recentSection: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  logItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  logDate: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4CAF50',
    width: 50,
  },
  logPreview: {
    flex: 1,
    fontSize: 14,
    color: '#1a1a1a',
  },
  arrow: {
    fontSize: 20,
    color: '#ccc',
  },
  emptyText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    paddingVertical: 20,
  },
});
