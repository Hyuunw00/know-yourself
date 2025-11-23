import React from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';

interface Props {
  birthdate: string;
  onBirthdateChange: (birthdate: string) => void;
}

export const BirthdateStep = ({ birthdate, onBirthdateChange }: Props) => {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>생년월일을 알려주세요</Text>
      <TextInput
        style={styles.input}
        placeholder="예: 1990-01-15"
        placeholderTextColor="#999"
        value={birthdate}
        onChangeText={onBirthdateChange}
        keyboardType="numbers-and-punctuation"
      />
      <Text style={styles.hint}>YYYY-MM-DD 형식으로 입력해주세요</Text>
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
  input: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    fontSize: 18,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  hint: {
    marginTop: 8,
    fontSize: 14,
    color: '#999',
  },
});
