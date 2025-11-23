import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { DailyLogModal } from '@/components/DailyLogModal';
import { LogHistoryScreen } from '@/screens/LogHistoryScreen';
import { ActivityGrass } from '@/components/ActivityGrass';
import { useDailyLogStore } from '@/stores/dailyLogStore';
import { useAuthStore } from '@/stores/authStore';
import { useAnalysisStore, ANALYSIS_INTERVAL } from '@/stores/analysisStore';
import { getProfile } from '@/services/profile';
import { DailyLog, UserProfile } from '@/types/database';
import { formatDateShort } from '@/utils/date';

interface Props {
  onGoProfile?: () => void;
}

export const HomeScreen = ({ onGoProfile }: Props) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedLog, setSelectedLog] = useState<DailyLog | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);
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

  // 화면 로드 시 데이터 불러오기
  useEffect(() => {
    if (user?.id) {
      fetchLogs(user.id);
      getProfile(user.id).then(setProfile);
    }
  }, [fetchLogs, user?.id]);

  const handleSaveLog = async (text: string) => {
    if (!user?.id) return;
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

  // 텍스트 미리보기 (30자 제한)
  const getPreview = (text: string) => {
    return text.length > 30 ? text.slice(0, 30) + '...' : text;
  };

  if (showHistory) {
    return <LogHistoryScreen onBack={() => setShowHistory(false)} />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* 헤더 */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <Text style={styles.title}>나의 기록</Text>
            <View style={styles.headerButtons}>
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

      {/* 일기 작성/수정 모달 */}
      <DailyLogModal
        visible={modalVisible}
        onClose={handleCloseModal}
        onSave={selectedLog ? undefined : handleSaveLog}
        onUpdate={selectedLog ? handleUpdateLog : undefined}
        onDelete={selectedLog ? handleDeleteLog : undefined}
        log={selectedLog}
      />
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
