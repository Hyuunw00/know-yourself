import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Alert,
} from 'react-native';
import { DailyLog } from '@/types/database';
import { formatDateMedium } from '@/utils/date';

interface DailyLogModalProps {
  visible: boolean;
  onClose: () => void;
  onSave?: (text: string) => void;
  onUpdate?: (id: string, text: string) => void;
  onDelete?: (id: string) => void;
  date?: string;
  log?: DailyLog | null; // 조회/수정 모드일 때 전달
}

const MAX_LENGTH = 300;

export const DailyLogModal: React.FC<DailyLogModalProps> = ({
  visible,
  onClose,
  onSave,
  onUpdate,
  onDelete,
  date,
  log,
}) => {
  const [text, setText] = useState('');
  const isEditMode = !!log;

  // log가 변경되면 text 초기화
  useEffect(() => {
    if (log) {
      setText(log.text);
    } else {
      setText('');
    }
  }, [log]);

  const handleSave = () => {
    if (!text.trim()) return;

    if (isEditMode && onUpdate) {
      onUpdate(log!.id, text);
    } else if (onSave) {
      onSave(text);
    }
    setText('');
    onClose();
  };

  const handleDelete = () => {
    if (log && onDelete) {
      Alert.alert(
        '기록 삭제',
        '이 기록을 삭제하시겠습니까?',
        [
          { text: '취소', style: 'cancel' },
          {
            text: '삭제',
            style: 'destructive',
            onPress: () => {
              onDelete(log.id);
              onClose();
            },
          },
        ]
      );
    }
  };

  const handleClose = () => {
    setText('');
    onClose();
  };

  // 날짜 포맷
  const displayDate = isEditMode
    ? formatDateMedium(log!.date)
    : date || formatDateMedium(new Date().toISOString());

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <TouchableWithoutFeedback onPress={handleClose}>
          <View style={styles.overlay}>
            <View style={styles.modalContent}>
              {/* 헤더 */}
              <View style={styles.header}>
                <TouchableOpacity onPress={handleClose}>
                  <Text style={styles.cancelButton}>취소</Text>
                </TouchableOpacity>
                <Text style={styles.date}>{displayDate}</Text>
                <View style={styles.headerRight}>
                  {isEditMode && onDelete && (
                    <TouchableOpacity onPress={handleDelete} style={styles.deleteBtn}>
                      <Text style={styles.deleteButton}>삭제</Text>
                    </TouchableOpacity>
                  )}
                  <TouchableOpacity onPress={handleSave}>
                    <Text style={styles.saveButton}>저장</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* 입력창 */}
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  placeholder="오늘 하루는 어땠나요?&#10;자유롭게 기록해보세요 ✍️"
                  placeholderTextColor="#999"
                  multiline
                  value={text}
                  onChangeText={setText}
                  maxLength={MAX_LENGTH}
                  autoFocus={!isEditMode}
                  textAlignVertical="top"
                />
              </View>

              {/* 글자수 + 힌트 */}
              <View style={styles.hintContainer}>
                <Text style={styles.charCount}>
                  {text.length} / {MAX_LENGTH}
                </Text>
                <Text style={styles.hint}>
                  💡 짧게라도 괜찮아요. 매일 기록하는 게 중요해요!
                </Text>
              </View>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    minHeight: '70%',
    maxHeight: '90%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  cancelButton: {
    fontSize: 16,
    color: '#666',
  },
  date: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  saveButton: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4CAF50',
  },
  inputContainer: {
    flex: 1,
    padding: 20,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#1a1a1a',
    lineHeight: 24,
  },
  hintContainer: {
    padding: 16,
    backgroundColor: '#f8f9fa',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  hint: {
    fontSize: 13,
    color: '#666',
    textAlign: 'center',
  },
  charCount: {
    fontSize: 12,
    color: '#999',
    textAlign: 'right',
    marginBottom: 8,
  },
  deleteButton: {
    fontSize: 16,
    color: '#ff4444',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  deleteBtn: {
    marginRight: 4,
  },
});
