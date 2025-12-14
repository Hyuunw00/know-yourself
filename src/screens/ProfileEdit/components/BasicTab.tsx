import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import DatePicker from 'react-native-date-picker';
import { MBTI_TYPES, GENDERS } from '@/constants';
import { UserProfile } from '@/types';

interface Props {
  profile: Partial<UserProfile>;
  setProfile: (profile: Partial<UserProfile>) => void;
}

export const BasicTab = ({ profile, setProfile }: Props) => {
  const [showDatePicker, setShowDatePicker] = useState(false);

  return (
    <>
      <View style={styles.section}>
        <Text style={styles.label}>이름</Text>
        <TextInput
          style={styles.input}
          value={profile.name || ''}
          onChangeText={text => setProfile({ ...profile, name: text })}
          placeholder="이름 또는 닉네임"
          placeholderTextColor="#999"
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>생년월일</Text>
        <TouchableOpacity
          style={styles.datePickerButton}
          onPress={() => setShowDatePicker(true)}
        >
          <Text
            style={profile.birthdate ? styles.dateText : styles.datePlaceholder}
          >
            {profile.birthdate
              ? new Date(profile.birthdate).toLocaleDateString('ko-KR', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })
              : '생년월일 선택'}
          </Text>
        </TouchableOpacity>
        <DatePicker
          modal
          open={showDatePicker}
          date={
            profile.birthdate
              ? new Date(profile.birthdate)
              : new Date(1990, 0, 1)
          }
          mode="date"
          maximumDate={new Date()}
          minimumDate={new Date(1900, 0, 1)}
          onConfirm={selectedDate => {
            setShowDatePicker(false);
            const formattedDate = selectedDate.toISOString().split('T')[0];
            setProfile({ ...profile, birthdate: formattedDate });
          }}
          onCancel={() => setShowDatePicker(false)}
          title="생년월일 선택"
          confirmText="확인"
          cancelText="취소"
          locale="ko"
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>성별</Text>
        <View style={styles.optionRow}>
          {GENDERS.map(g => (
            <TouchableOpacity
              key={g.value}
              style={[
                styles.optionButton,
                profile.gender === g.value && styles.optionSelected,
              ]}
              onPress={() => setProfile({ ...profile, gender: g.value })}
            >
              <Text
                style={[
                  styles.optionText,
                  profile.gender === g.value && styles.optionTextSelected,
                ]}
              >
                {g.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>MBTI</Text>
        <View style={styles.mbtiContainer}>
          {MBTI_TYPES.map(type => (
            <TouchableOpacity
              key={type}
              style={[
                styles.mbtiButton,
                profile.mbti === type && styles.mbtiSelected,
              ]}
              onPress={() => setProfile({ ...profile, mbti: type })}
            >
              <Text
                style={[
                  styles.mbtiText,
                  profile.mbti === type && styles.mbtiTextSelected,
                ]}
              >
                {type}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>직업</Text>
        <TextInput
          style={styles.input}
          value={profile.occupation || ''}
          onChangeText={text => setProfile({ ...profile, occupation: text })}
          placeholder="예: 학생, 개발자, 디자이너"
          placeholderTextColor="#999"
        />
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  section: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#fff',
    padding: 14,
    borderRadius: 10,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  datePickerButton: {
    backgroundColor: '#fff',
    padding: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  dateText: {
    fontSize: 16,
    color: '#1a1a1a',
  },
  datePlaceholder: {
    fontSize: 16,
    color: '#999',
  },
  optionRow: {
    flexDirection: 'row',
    gap: 10,
  },
  optionButton: {
    flex: 1,
    padding: 12,
    borderRadius: 10,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    alignItems: 'center',
  },
  optionSelected: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  optionText: {
    fontSize: 14,
    color: '#333',
  },
  optionTextSelected: {
    color: '#fff',
    fontWeight: '600',
  },
  mbtiContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  mbtiButton: {
    width: '22%',
    padding: 10,
    borderRadius: 8,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    alignItems: 'center',
  },
  mbtiSelected: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  mbtiText: {
    fontSize: 12,
    color: '#333',
  },
  mbtiTextSelected: {
    color: '#fff',
  },
});
