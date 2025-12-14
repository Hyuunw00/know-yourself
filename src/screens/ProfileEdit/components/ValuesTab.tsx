import React from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { UserProfile } from '@/types';

interface Props {
  profile: Partial<UserProfile>;
  setProfile: (profile: Partial<UserProfile>) => void;
}

export const ValuesTab = ({ profile, setProfile }: Props) => {
  return (
    <>
      <View style={styles.section}>
        <Text style={styles.label}>중요하게 생각하는 가치</Text>
        <TextInput
          style={styles.textArea}
          value={profile.values || ''}
          onChangeText={text => setProfile({ ...profile, values: text })}
          placeholder="예: 가족과의 시간, 자기계발, 일과 삶의 균형을 가장 중요하게 생각해요."
          placeholderTextColor="#999"
          multiline
        />
        <Text style={styles.hint}>자유롭게 서술해주세요</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>인생 목표</Text>
        <TextInput
          style={styles.textArea}
          value={profile.goals || ''}
          onChangeText={text => setProfile({ ...profile, goals: text })}
          placeholder="예: 30대에 경제적 자유를 이루고, 하고 싶은 일을 선택해서 할 수 있는 삶을 살고 싶어요."
          placeholderTextColor="#999"
          multiline
        />
        <Text style={styles.hint}>자유롭게 서술해주세요</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>자기소개 한 줄</Text>
        <TextInput
          style={styles.textArea}
          value={profile.bio || ''}
          onChangeText={text => setProfile({ ...profile, bio: text })}
          placeholder="나를 한 문장으로 표현한다면?"
          placeholderTextColor="#999"
          multiline
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
});
