import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { DailyLogModal } from '@/components/DailyLogModal';
import { useDailyLogStore } from '@/stores/dailyLogStore';
import { useAuthStore } from '@/stores/authStore';
import { DailyLog } from '@/types/database';
import { formatDateLong, formatTime } from '@/utils/date';

interface Props {
  onBack: () => void;
}

export const LogHistoryScreen = ({ onBack }: Props) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedLog, setSelectedLog] = useState<DailyLog | null>(null);
  const { logs, isLoading, fetchLogs, updateLog, deleteLog } = useDailyLogStore();
  const { user } = useAuthStore();

  useEffect(() => {
    if (user?.id) {
      fetchLogs(user.id);
    }
  }, [fetchLogs, user?.id]);

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

  const renderLogItem = ({ item }: { item: DailyLog }) => (
    <TouchableOpacity style={styles.logItem} onPress={() => handleLogPress(item)}>
      <View style={styles.logHeader}>
        <Text style={styles.logDate}>{formatDateLong(item.date)}</Text>
        <Text style={styles.logTime}>{formatTime(item.updated_at)}</Text>
      </View>
      <Text style={styles.logText} numberOfLines={3}>{item.text}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* 헤더 */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack}>
          <Text style={styles.backButton}>← 뒤로</Text>
        </TouchableOpacity>
        <Text style={styles.title}>기록 히스토리</Text>
        <View style={styles.placeholder} />
      </View>

      {/* 목록 */}
      {isLoading ? (
        <ActivityIndicator color="#4CAF50" style={styles.loading} />
      ) : logs.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>아직 기록이 없어요</Text>
        </View>
      ) : (
        <FlatList
          data={logs}
          keyExtractor={(item) => item.id}
          renderItem={renderLogItem}
          contentContainerStyle={styles.listContent}
        />
      )}

      {/* 수정 모달 */}
      <DailyLogModal
        visible={modalVisible}
        onClose={handleCloseModal}
        onUpdate={handleUpdateLog}
        onDelete={handleDeleteLog}
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  backButton: {
    fontSize: 16,
    color: '#4CAF50',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  placeholder: {
    width: 50,
  },
  loading: {
    marginTop: 40,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
  },
  listContent: {
    padding: 16,
  },
  logItem: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  logHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  logDate: {
    fontSize: 13,
    color: '#4CAF50',
    fontWeight: '600',
  },
  logTime: {
    fontSize: 12,
    color: '#999',
  },
  logText: {
    fontSize: 15,
    color: '#1a1a1a',
    lineHeight: 22,
  },
});
