import React from 'react';
import { View, StyleSheet, ViewStyle, TextInputProps } from 'react-native';
import { Typography, Input } from '@/components/atoms';

interface LabeledTextAreaProps extends Omit<TextInputProps, 'style'> {
  label: string;
  hint?: string;
  containerStyle?: ViewStyle;
}

export const LabeledTextArea = ({
  label,
  hint,
  containerStyle,
  ...inputProps
}: LabeledTextAreaProps) => {
  return (
    <View style={[styles.container, containerStyle]}>
      <Typography variant="label" style={styles.label}>
        {label}
      </Typography>
      <Input variant="multiline" {...inputProps} />
      {hint && (
        <Typography variant="hint" color="tertiary" style={styles.hint}>
          {hint}
        </Typography>
      )}
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
  hint: {
    marginTop: 6,
  },
});
