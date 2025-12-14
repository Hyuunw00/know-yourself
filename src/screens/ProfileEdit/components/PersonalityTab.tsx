import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { PERSONALITY_KEYWORDS } from '@/constants';
import { UserProfile } from '@/types';

interface Props {
  profile: Partial<UserProfile>;
  setProfile: (profile: Partial<UserProfile>) => void;
}

export const PersonalityTab = ({ profile, setProfile }: Props) => {
  const [customInput, setCustomInput] = useState('');

  const toggleKeyword = (keyword: string) => {
    const current = profile.personality_keywords || [];
    const updated = current.includes(keyword)
      ? current.filter(k => k !== keyword)
      : [...current, keyword];
    setProfile({ ...profile, personality_keywords: updated });
  };

  const handleAddCustom = () => {
    const value = customInput.trim();
    if (!value) return;

    const current = profile.personality_keywords || [];
    if (!current.includes(value)) {
      setProfile({ ...profile, personality_keywords: [...current, value] });
    }
    setCustomInput('');
  };

  const selected = profile.personality_keywords || [];
  const customValues = selected.filter(
    v => !(PERSONALITY_KEYWORDS as readonly string[]).includes(v),
  );

  return (
    <>
      <View style={styles.section}>
        <Text style={styles.label}>나를 표현하는 키워드</Text>
        <Text style={styles.hint}>여러 개 선택 가능</Text>
        <View style={styles.chipContainer}>
          {PERSONALITY_KEYWORDS.map(keyword => (
            <TouchableOpacity
              key={keyword}
              style={[styles.chip, selected.includes(keyword) && styles.chipSelected]}
              onPress={() => toggleKeyword(keyword)}
            >
              <Text
                style={[
                  styles.chipText,
                  selected.includes(keyword) && styles.chipTextSelected,
                ]}
              >
                {keyword}
              </Text>
            </TouchableOpacity>
          ))}
          {customValues.map(value => (
            <TouchableOpacity
              key={value}
              style={[styles.chip, styles.chipSelected, styles.chipCustom]}
              onPress={() => toggleKeyword(value)}
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
        <Text style={styles.label}>나의 장점</Text>
        <TextInput
          style={styles.textArea}
          value={profile.strengths || ''}
          onChangeText={text => setProfile({ ...profile, strengths: text })}
          placeholder="예: 책임감이 강해서 맡은 일은 끝까지 해내는 편이에요. 친구들이 저를 믿고 의지하는 이유인 것 같아요."
          placeholderTextColor="#999"
          multiline
        />
        <Text style={styles.hint}>자유롭게 서술해주세요</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>개선하고 싶은 점</Text>
        <TextInput
          style={styles.textArea}
          value={profile.weaknesses || ''}
          onChangeText={text => setProfile({ ...profile, weaknesses: text })}
          placeholder="예: 결정을 내릴 때 우유부단해서 기회를 놓칠 때가 많아요. 빨리 판단하고 실행하는 능력을 키우고 싶어요."
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
