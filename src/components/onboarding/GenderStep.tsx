import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { GENDERS } from '@/constants/onboarding';

interface Props {
  gender: string | null;
  onGenderChange: (gender: string) => void;
}

export const GenderStep = ({ gender, onGenderChange }: Props) => {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>성별이 어떻게 되세요?</Text>
      <View style={styles.optionContainer}>
        {GENDERS.map((g) => (
          <TouchableOpacity
            key={g.value}
            style={[
              styles.optionButton,
              gender === g.value && styles.optionSelected,
            ]}
            onPress={() => onGenderChange(g.value)}>
            <Text
              style={[
                styles.optionText,
                gender === g.value && styles.optionTextSelected,
              ]}>
              {g.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
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
  optionContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  optionButton: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
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
    fontSize: 16,
    color: '#333',
  },
  optionTextSelected: {
    color: '#fff',
    fontWeight: '600',
  },
});
