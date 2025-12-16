import React from 'react';
import { Text, StyleSheet, TextStyle } from 'react-native';

type TypographyVariant = 'h1' | 'h2' | 'h3' | 'body' | 'label' | 'caption' | 'hint';
type TypographyColor = 'primary' | 'secondary' | 'tertiary' | 'success' | 'danger';
type TypographyAlign = 'left' | 'center' | 'right';

interface TypographyProps {
  children: React.ReactNode;
  variant?: TypographyVariant;
  color?: TypographyColor;
  align?: TypographyAlign;
  numberOfLines?: number;
  style?: TextStyle;
}

export const Typography = ({
  children,
  variant = 'body',
  color = 'primary',
  align = 'left',
  numberOfLines,
  style,
}: TypographyProps) => {
  return (
    <Text
      style={[
        styles[variant],
        colors[color],
        { textAlign: align },
        style,
      ]}
      numberOfLines={numberOfLines}
    >
      {children}
    </Text>
  );
};

const styles = StyleSheet.create({
  h1: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  h2: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  h3: {
    fontSize: 18,
    fontWeight: '600',
  },
  body: {
    fontSize: 16,
    fontWeight: '400',
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
  },
  caption: {
    fontSize: 14,
    fontWeight: '400',
  },
  hint: {
    fontSize: 12,
    fontWeight: '400',
  },
});

const colors = StyleSheet.create({
  primary: {
    color: '#1a1a1a',
  },
  secondary: {
    color: '#666',
  },
  tertiary: {
    color: '#999',
  },
  success: {
    color: '#4CAF50',
  },
  danger: {
    color: '#ff4444',
  },
});
