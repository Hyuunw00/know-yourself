import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { DailyLogModal } from '@/components/DailyLogModal';

export const HomeScreen = () => {
  const [modalVisible, setModalVisible] = useState(false);

  // TODO: 실제 데이터 연동
  const recentLogs = [
    { date: '11/19', preview: '행복했던 하루' },
    { date: '11/18', preview: '피곤한 날' },
    { date: '11/17', preview: '새로운 시작' },
  ];

  const handleSaveLog = (text: string) => {
    // TODO: Supabase에 저장
    console.log('저장:', text);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* 헤더 */}
        <View style={styles.header}>
          <Text style={styles.title}>나의 기록</Text>
          <Text style={styles.subtitle}>매일 기록하며 나를 알아가요</Text>
        </View>

        {/* 잔디 UI (임시 - 나중에 구현) */}
        <View style={styles.activitySection}>
          <Text style={styles.sectionTitle}>기록 현황</Text>
          <View style={styles.grassContainer}>
            {/* TODO: 실제 잔디 UI 컴포넌트로 교체 */}
            <Text style={styles.placeholder}>📊 깃허브 스타일 잔디 UI</Text>
            <Text style={styles.placeholder}>(곧 추가 예정)</Text>
          </View>
        </View>

        {/* 오늘 기록하기 버튼 */}
        <TouchableOpacity
          style={styles.mainButton}
          onPress={() => setModalVisible(true)}>
          <Text style={styles.mainButtonText}>✍️ 오늘 기록하기</Text>
        </TouchableOpacity>

        {/* 최근 기록 */}
        <View style={styles.recentSection}>
          <Text style={styles.sectionTitle}>최근 기록</Text>
          {recentLogs.map((log, index) => (
            <TouchableOpacity key={index} style={styles.logItem}>
              <Text style={styles.logDate}>{log.date}</Text>
              <Text style={styles.logPreview}>{log.preview}</Text>
              <Text style={styles.arrow}>›</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* 일기 작성 모달 */}
      <DailyLogModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSave={handleSaveLog}
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
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 4,
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
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 12,
  },
  grassContainer: {
    alignItems: 'center',
    paddingVertical: 20,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
  },
  placeholder: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
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
});
