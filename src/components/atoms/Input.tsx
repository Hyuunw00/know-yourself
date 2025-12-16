import React from 'react';
import {
  TextInput,
  StyleSheet,
  TextInputProps,
  ViewStyle,
} from 'react-native';

type InputVariant = 'default' | 'multiline' | 'password';

interface InputProps extends Omit<TextInputProps, 'style'> {
  variant?: InputVariant;
  style?: ViewStyle;
}

export const Input = ({
  variant = 'default',
  style,
  ...props
}: InputProps) => {
  const isMultiline = variant === 'multiline';
  const isPassword = variant === 'password';

  return (
    <TextInput
      style={[
        styles.base,
        isMultiline && styles.multiline,
        style,
      ]}
      placeholderTextColor="#999"
      multiline={isMultiline}
      textAlignVertical={isMultiline ? 'top' : 'center'}
      secureTextEntry={isPassword}
      {...props}
    />
  );
};

const styles = StyleSheet.create({
  base: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#1a1a1a',
  },
  multiline: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
});
