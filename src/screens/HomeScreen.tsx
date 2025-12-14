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
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { DailyLogModal } from '@/components/DailyLogModal';
import { ActivityGrass } from '@/components/ActivityGrass';
import {
  useDailyLogs,
  useAddDailyLog,
  useUpdateDailyLog,
  useDeleteDailyLog,
} from '@/queries/useDailyLogs';
import { useAuthStore } from '@/stores/authStore';
import { useLatestAnalysis, useRunAnalysis } from '@/queries/useAnalysis';
import { shouldTriggerAnalysis } from '@/utils/analysis';
import { getProfile, updateLastAppOpenAt } from '@/services/profile.service';
import { DailyLog, UserProfile } from '@/types/database';
import { MainStackParamList } from '@/types';
import { formatDateShort } from '@/utils/date';
import { getUnreadCount } from '@/services/notification.service';

type NavigationProp = NativeStackNavigationProp<MainStackParamList>;

export const HomeScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedLog, setSelectedLog] = useState<DailyLog | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);

  const { user, logout } = useAuthStore();

  // React Query - Analysis
  const { data: latestAnalysis } = useLatestAnalysis(user?.id);
  const runAnalysisMutation = useRunAnalysis();

  // React Query - DailyLogs
  const currentYear = new Date().getFullYear();
  const { data: recentData, isLoading } = useDailyLogs(user?.id, { limit: 5 });
  const { data: yearData } = useDailyLogs(user?.id, {
    startDate: `${currentYear}-01-01`,
    endDate: `${currentYear}-12-31`,
  });
  const { data: totalData } = useDailyLogs(user?.id);

  const logs = recentData?.data ?? [];
  const yearLogs = yearData?.data ?? [];
  const totalCount = totalData?.count ?? 0;

  const addLogMutation = useAddDailyLog(user?.id);
  const updateLogMutation = useUpdateDailyLog();
  const deleteLogMutation = useDeleteDailyLog();

  const loadUnreadCount = async () => {
    if (!user?.id) return;
    const count = await getUnreadCount(user.id);
    setUnreadCount(count);
  };

  useEffect(() => {
    if (user?.id) {
      getProfile(user.id).then(setProfile);
      updateLastAppOpenAt(user.id);
      loadUnreadCount();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const handleSaveLog = async (text: string) => {
    if (!user?.id) return;

    addLogMutation.mutate(text, {
      onSuccess: () => {
        setModalVisible(false);

        // 분석 트리거 체크
        const newTotalCount = totalCount + 1;
        const lastAnalysisLogCount = latestAnalysis?.log_count || 0;

        if (
          profile &&
          shouldTriggerAnalysis(newTotalCount, lastAnalysisLogCount)
        ) {
          console.log('[HomeScreen] ✅ 조건 충족! runAnalysis 실행');
          runAnalysisMutation.mutate({
            userId: user.id,
            profile,
            logCount: newTotalCount,
            latestAnalysis: latestAnalysis || null,
          });
        }
      },
    });
  };

  const handleLogPress = (log: DailyLog) => {
    setSelectedLog(log);
    setModalVisible(true);
  };

  const handleUpdateLog = (logId: string, text: string) => {
    updateLogMutation.mutate(
      { logId, text },
      {
        onSuccess: () => {
          setSelectedLog(null);
          setModalVisible(false);
        },
      },
    );
  };

  const handleDeleteLog = (logId: string) => {
    deleteLogMutation.mutate(logId, {
      onSuccess: () => {
        setSelectedLog(null);
        setModalVisible(false);
      },
    });
  };

  const handleCloseModal = () => {
    setSelectedLog(null);
    setModalVisible(false);
  };

  // 텍스트 미리보기 (30자 제한)
  const getPreview = (text: string) => {
    return text.length > 30 ? text.slice(0, 30) + '...' : text;
  };

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
                onPress={() => navigation.navigate('NotificationHistory')}
                style={styles.notificationButton}
              >
                <Text style={styles.notificationIcon}>📬</Text>
                {unreadCount > 0 && (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>
                      {unreadCount > 99 ? '99+' : unreadCount}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => navigation.navigate('Profile')}
                style={styles.headerButton}
              >
                <Text style={styles.headerButtonText}>프로필</Text>
              </TouchableOpacity>
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
          <ActivityGrass logs={yearLogs} />
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
              <TouchableOpacity
                onPress={() => navigation.navigate('LogHistory')}
              >
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

      {/* AI 질문 모달은 RootNavigator로 이동 (전역 처리) */}
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
