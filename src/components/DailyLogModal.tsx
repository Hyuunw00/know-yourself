import React, { useState } from 'react';
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
  Keyboard,
} from 'react-native';

interface DailyLogModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (text: string) => void;
  date?: string;
}

export const DailyLogModal: React.FC<DailyLogModalProps> = ({
  visible,
  onClose,
  onSave,
  date,
}) => {
  const [text, setText] = useState('');

  const handleSave = () => {
    if (text.trim()) {
      onSave(text);
      setText('');
      onClose();
    }
  };

  const handleClose = () => {
    setText('');
    onClose();
  };

  // 오늘 날짜 포맷
  const today = date || new Date().toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={handleClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.overlay}>
            <View style={styles.modalContent}>
              {/* 헤더 */}
              <View style={styles.header}>
                <TouchableOpacity onPress={handleClose}>
                  <Text style={styles.cancelButton}>취소</Text>
                </TouchableOpacity>
                <Text style={styles.date}>{today}</Text>
                <TouchableOpacity onPress={handleSave}>
                  <Text style={styles.saveButton}>저장</Text>
                </TouchableOpacity>
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
                  autoFocus
                  textAlignVertical="top"
                />
              </View>

              {/* 힌트 */}
              <View style={styles.hintContainer}>
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
});
