import React from 'react';
import { View, StyleSheet, ViewStyle, TextInputProps } from 'react-native';
import { Typography, Input } from '@/components/atoms';

interface LabeledInputProps extends Omit<TextInputProps, 'style'> {
  label: string;
  containerStyle?: ViewStyle;
}

export const LabeledInput = ({
  label,
  containerStyle,
  ...inputProps
}: LabeledInputProps) => {
  return (
    <View style={[styles.container, containerStyle]}>
      <Typography variant="label" style={styles.label}>
        {label}
      </Typography>
      <Input {...inputProps} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    marginBottom: 8,
  },
});
