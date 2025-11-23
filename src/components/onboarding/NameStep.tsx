import React from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';

interface Props {
  name: string;
  onNameChange: (name: string) => void;
}

export const NameStep = ({ name, onNameChange }: Props) => {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>이름이 뭐예요?</Text>
      <TextInput
        style={styles.input}
        placeholder="이름 또는 닉네임"
        placeholderTextColor="#999"
        value={name}
        onChangeText={onNameChange}
        autoFocus
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
  input: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    fontSize: 18,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
});
