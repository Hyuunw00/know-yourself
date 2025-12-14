import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { INTERESTS } from '@/constants/profile';
import { UserProfile } from '@/types';

interface Props {
  profile: Partial<UserProfile>;
  setProfile: (profile: Partial<UserProfile>) => void;
}

export const LifestyleTab = ({ profile, setProfile }: Props) => {
  const [customInput, setCustomInput] = useState('');

  const toggleInterest = (interest: string) => {
    const current = profile.interests || [];
    const updated = current.includes(interest)
      ? current.filter(i => i !== interest)
      : [...current, interest];
    setProfile({ ...profile, interests: updated });
  };

  const handleAddCustom = () => {
    const value = customInput.trim();
    if (!value) return;

    const current = profile.interests || [];
    if (!current.includes(value)) {
      setProfile({ ...profile, interests: [...current, value] });
    }
    setCustomInput('');
  };

  const selected = profile.interests || [];
  const customValues = selected.filter(
    v => !(INTERESTS as readonly string[]).includes(v),
  );

  return (
    <>
      <View style={styles.section}>
        <Text style={styles.label}>관심사/취미</Text>
        <View style={styles.chipContainer}>
          {INTERESTS.map(interest => (
            <TouchableOpacity
              key={interest}
              style={[styles.chip, selected.includes(interest) && styles.chipSelected]}
              onPress={() => toggleInterest(interest)}
            >
              <Text
                style={[
                  styles.chipText,
                  selected.includes(interest) && styles.chipTextSelected,
                ]}
              >
                {interest}
              </Text>
            </TouchableOpacity>
          ))}
          {customValues.map(value => (
            <TouchableOpacity
              key={value}
              style={[styles.chip, styles.chipSelected, styles.chipCustom]}
              onPress={() => toggleInterest(value)}
            >
              <Text style={[styles.chipText, styles.chipTextSelected]}>
                {value} ✕
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        <View style={styles.customInputRow}>
          <TextInput
            style={styles.customInput}
            value={customInput}
            onChangeText={setCustomInput}
            placeholder="직접 입력"
            placeholderTextColor="#999"
            onSubmitEditing={handleAddCustom}
          />
          <TouchableOpacity style={styles.addButton} onPress={handleAddCustom}>
            <Text style={styles.addButtonText}>추가</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>좋아하는 것</Text>
        <TextInput
          style={styles.textArea}
          value={profile.likes || ''}
          onChangeText={text => setProfile({ ...profile, likes: text })}
          placeholder="예: 커피 마시면서 책 읽는 시간, 비 오는 날 창밖 바라보기, 새벽의 고요한 분위기"
          placeholderTextColor="#999"
          multiline
        />
        <Text style={styles.hint}>자유롭게 서술해주세요</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>싫어하는 것</Text>
        <TextInput
          style={styles.textArea}
          value={profile.dislikes || ''}
          onChangeText={text => setProfile({ ...profile, dislikes: text })}
          placeholder="예: 거짓말하는 사람, 무더운 여름 날씨, 복잡한 인파 속에 있을 때"
          placeholderTextColor="#999"
          multiline
        />
        <Text style={styles.hint}>자유롭게 서술해주세요</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>스트레스 해소법</Text>
        <TextInput
          style={styles.textArea}
          value={profile.stress_relief || ''}
          onChangeText={text => setProfile({ ...profile, stress_relief: text })}
          placeholder="예: 운동하기, 음악 듣기, 친구들과 수다 떨기 등으로 스트레스를 풀어요."
          placeholderTextColor="#999"
          multiline
        />
        <Text style={styles.hint}>자유롭게 서술해주세요</Text>
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
  hint: {
    fontSize: 12,
    color: '#999',
    marginBottom: 8,
  },
  textArea: {
    backgroundColor: '#fff',
    padding: 14,
    borderRadius: 10,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    minHeight: 80,
    textAlignVertical: 'top',
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  chipSelected: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  chipText: {
    fontSize: 14,
    color: '#333',
  },
  chipTextSelected: {
    color: '#fff',
  },
  chipCustom: {
    backgroundColor: '#2196F3',
    borderColor: '#2196F3',
  },
  customInputRow: {
    flexDirection: 'row',
    marginTop: 10,
    gap: 8,
  },
  customInput: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 10,
    fontSize: 14,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  addButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 16,
    borderRadius: 10,
    justifyContent: 'center',
  },
  addButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});
