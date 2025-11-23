import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MBTI_TYPES } from '@/constants/onboarding';

interface Props {
  mbti: string | null;
  onMBTIChange: (mbti: string) => void;
}

export const MBTIStep = ({ mbti, onMBTIChange }: Props) => {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>MBTI가 뭐예요?</Text>
      <View style={styles.mbtiContainer}>
        {MBTI_TYPES.map((type) => (
          <TouchableOpacity
            key={type}
            style={[
              styles.mbtiButton,
              mbti === type && styles.mbtiSelected,
            ]}
            onPress={() => onMBTIChange(type)}>
            <Text
              style={[
                styles.mbtiText,
                mbti === type && styles.mbtiTextSelected,
              ]}>
              {type}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      <TouchableOpacity onPress={() => onMBTIChange('모름')}>
        <Text style={styles.skipText}>잘 모르겠어요</Text>
      </TouchableOpacity>
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
  mbtiContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  mbtiButton: {
    width: '22%',
    padding: 12,
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
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  mbtiTextSelected: {
    color: '#fff',
  },
  skipText: {
    marginTop: 16,
    textAlign: 'center',
    color: '#999',
    fontSize: 14,
  },
});
