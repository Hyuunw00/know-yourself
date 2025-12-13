import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import DatePicker from 'react-native-date-picker';
import { DailyLogModal } from '@/components/DailyLogModal';
import { useAuthStore } from '@/stores/authStore';
import { useLogHistoryFilterStore } from '@/stores/logHistoryFilterStore';
import { DailyLog } from '@/types/database';
import { formatDateLong, formatTime } from '@/utils/date';
import {
  getDailyLogs,
  updateDailyLog,
  deleteDailyLog,
} from '@/services/dailyLog.service';

const PAGE_SIZE = 10;

export const LogHistoryScreen = () => {
  const navigation = useNavigation();
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedLog, setSelectedLog] = useState<DailyLog | null>(null);
  const [logs, setLogs] = useState<DailyLog[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);

  const { user } = useAuthStore();
  const {
    startDate,
    endDate,
    setStartDate,
    setEndDate,
    clearFilters,
    initializeDefaultDates,
  } = useLogHistoryFilterStore();

  // 최초 진입 시 기본 날짜 설정
  useEffect(() => {
    if (!startDate && !endDate) {
      initializeDefaultDates();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadLogs = useCallback(
    async (offset: number = 0) => {
      if (!user?.id) return;

      if (offset === 0) {
        setIsLoading(true);
      } else {
        setIsLoadingMore(true);
      }

      const data = await getDailyLogs(user.id, {
        limit: PAGE_SIZE,
        offset,
        startDate,
        endDate,
      });

      if (offset === 0) {
        setLogs(data);
      } else {
        setLogs(prev => [...prev, ...data]);
      }

      setHasMore(data.length === PAGE_SIZE);
      setIsLoading(false);
      setIsLoadingMore(false);
      setRefreshing(false);
    },
    [user?.id, startDate, endDate],
  );

  useEffect(() => {
    loadLogs();
  }, [loadLogs]);

  const handleLoadMore = () => {
    if (!isLoadingMore && hasMore && !isLoading) {
      loadLogs(logs.length);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadLogs(0);
  };

  const handleLogPress = (log: DailyLog) => {
    setSelectedLog(log);
    setModalVisible(true);
  };

  const handleUpdateLog = async (logId: string, text: string) => {
    const updated = await updateDailyLog(logId, text);
    if (updated) {
      setLogs(prev => prev.map(log => (log.id === logId ? updated : log)));
    }
    setSelectedLog(null);
    setModalVisible(false);
  };

  const handleDeleteLog = async (logId: string) => {
    const success = await deleteDailyLog(logId);
    if (success) {
      setLogs(prev => prev.filter(log => log.id !== logId));
    }
    setSelectedLog(null);
    setModalVisible(false);
  };

  const handleCloseModal = () => {
    setSelectedLog(null);
    setModalVisible(false);
  };

  const renderLogItem = ({ item }: { item: DailyLog }) => (
    <TouchableOpacity
      style={styles.logItem}
      onPress={() => handleLogPress(item)}
    >
      <View style={styles.logHeader}>
        <Text style={styles.logDate}>{formatDateLong(item.date)}</Text>
        <Text style={styles.logTime}>{formatTime(item.updated_at)}</Text>
      </View>
      <Text style={styles.logText} numberOfLines={3}>
        {item.text}
      </Text>
    </TouchableOpacity>
  );

  const renderFooter = () => {
    if (!isLoadingMore) return null;
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator color="#4CAF50" />
      </View>
    );
  };

  const renderEmpty = () => {
    if (isLoading) return null;
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>
          {startDate || endDate
            ? '해당 기간에 기록이 없어요'
            : '아직 기록이 없어요'}
        </Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>← 뒤로</Text>
        </TouchableOpacity>
        <Text style={styles.title}>기록 히스토리</Text>
        <View style={styles.placeholder} />
      </View>

      <View style={styles.filterContainer}>
        <View style={styles.filterRow}>
          <TouchableOpacity
            style={styles.dateFilterButton}
            onPress={() => setShowStartPicker(true)}
          >
            <Text style={styles.dateFilterLabel}>시작일</Text>
            <Text
              style={
                startDate ? styles.dateFilterText : styles.dateFilterPlaceholder
              }
            >
              {startDate || '선택'}
            </Text>
          </TouchableOpacity>

          <Text style={styles.dateSeparator}>~</Text>

          <TouchableOpacity
            style={styles.dateFilterButton}
            onPress={() => setShowEndPicker(true)}
          >
            <Text style={styles.dateFilterLabel}>종료일</Text>
            <Text
              style={
                endDate ? styles.dateFilterText : styles.dateFilterPlaceholder
              }
            >
              {endDate || '선택'}
            </Text>
          </TouchableOpacity>

          {(startDate || endDate) && (
            <TouchableOpacity style={styles.clearButton} onPress={clearFilters}>
              <Text style={styles.clearButtonText}>✕</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      <DatePicker
        modal
        open={showStartPicker}
        date={startDate ? new Date(startDate) : new Date()}
        mode="date"
        maximumDate={endDate ? new Date(endDate) : new Date()}
        onConfirm={date => {
          setShowStartPicker(false);
          setStartDate(date.toISOString().split('T')[0]);
        }}
        onCancel={() => setShowStartPicker(false)}
        title="시작일 선택"
        confirmText="확인"
        cancelText="취소"
        locale="ko"
      />

      <DatePicker
        modal
        open={showEndPicker}
        date={endDate ? new Date(endDate) : new Date()}
        mode="date"
        minimumDate={startDate ? new Date(startDate) : undefined}
        maximumDate={new Date()}
        onConfirm={date => {
          setShowEndPicker(false);
          setEndDate(date.toISOString().split('T')[0]);
        }}
        onCancel={() => setShowEndPicker(false)}
        title="종료일 선택"
        confirmText="확인"
        cancelText="취소"
        locale="ko"
      />

      {isLoading ? (
        <ActivityIndicator color="#4CAF50" style={styles.loading} />
      ) : (
        <FlatList
          data={logs}
          keyExtractor={item => item.id}
          renderItem={renderLogItem}
          contentContainerStyle={styles.listContent}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          ListFooterComponent={renderFooter}
          ListEmptyComponent={renderEmpty}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor="#4CAF50"
            />
          }
        />
      )}

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
  filterContainer: {
    backgroundColor: '#fff',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dateFilterButton: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  dateFilterLabel: {
    fontSize: 11,
    color: '#666',
    marginBottom: 4,
  },
  dateFilterText: {
    fontSize: 14,
    color: '#1a1a1a',
  },
  dateFilterPlaceholder: {
    fontSize: 14,
    color: '#999',
  },
  dateSeparator: {
    fontSize: 16,
    color: '#999',
  },
  clearButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#ff4444',
    justifyContent: 'center',
    alignItems: 'center',
  },
  clearButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loading: {
    marginTop: 40,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
  },
  listContent: {
    padding: 16,
    flexGrow: 1,
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
  footerLoader: {
    paddingVertical: 20,
    alignItems: 'center',
  },
});
