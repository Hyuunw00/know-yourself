import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import DatePicker from 'react-native-date-picker';

interface Props {
  birthdate: string;
  onBirthdateChange: (birthdate: string) => void;
}

export const BirthdateStep = ({ birthdate, onBirthdateChange }: Props) => {
  const [open, setOpen] = useState(false);
  const [date, setDate] = useState<Date>(() => {
    if (birthdate) {
      return new Date(birthdate);
    }
    // 기본값: 30년 전
    const defaultDate = new Date();
    defaultDate.setFullYear(defaultDate.getFullYear() - 30);
    return defaultDate;
  });

  const handleConfirm = (selectedDate: Date) => {
    setOpen(false);
    setDate(selectedDate);
    // YYYY-MM-DD 형식으로 변환
    const formatted = selectedDate.toISOString().split('T')[0];
    onBirthdateChange(formatted);
  };

  const displayDate = birthdate
    ? new Date(birthdate).toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : '날짜를 선택하세요';

  return (
    <View style={styles.container}>
      <Text style={styles.label}>생년월일을 알려주세요</Text>
      <TouchableOpacity style={styles.dateButton} onPress={() => setOpen(true)}>
        <Text style={[styles.dateText, !birthdate && styles.placeholder]}>
          {displayDate}
        </Text>
      </TouchableOpacity>
      <DatePicker
        modal
        open={open}
        date={date}
        mode="date"
        maximumDate={new Date()}
        minimumDate={new Date(1900, 0, 1)}
        onConfirm={handleConfirm}
        onCancel={() => setOpen(false)}
        title="생년월일 선택"
        confirmText="확인"
        cancelText="취소"
        locale="ko"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 30,
  },
  label: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 12,
  },
  dateButton: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  dateText: {
    fontSize: 18,
    color: '#1a1a1a',
  },
  placeholder: {
    color: '#999',
  },
});
