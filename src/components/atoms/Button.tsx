import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
} from 'react-native';

type ButtonVariant = 'primary' | 'secondary' | 'text' | 'danger' | 'ghost';
type ButtonSize = 'large' | 'medium' | 'small';

interface ButtonProps {
  children: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  isLoading?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const Button = ({
  children,
  onPress,
  variant = 'primary',
  size = 'large',
  disabled = false,
  isLoading = false,
  style,
  textStyle,
}: ButtonProps) => {
  const isDisabled = disabled || isLoading;

  return (
    <TouchableOpacity
      style={[
        styles.base,
        styles[variant],
        styles[size],
        isDisabled && styles.disabled,
        style,
      ]}
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.7}
    >
      {isLoading ? (
        <ActivityIndicator
          color={variant === 'primary' ? '#fff' : '#4CAF50'}
          size="small"
        />
      ) : (
        <Text
          style={[
            styles.baseText,
            styles[`${variant}Text`],
            styles[`${size}Text`],
            isDisabled && styles.disabledText,
            textStyle,
          ]}
        >
          {children}
        </Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  // Base
  base: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
  },

  // Variants
  primary: {
    backgroundColor: '#4CAF50',
  },
  secondary: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#4CAF50',
  },
  text: {
    backgroundColor: 'transparent',
  },
  danger: {
    backgroundColor: 'transparent',
  },
  ghost: {
    backgroundColor: 'transparent',
  },

  // Sizes
  large: {
    padding: 16,
  },
  medium: {
    padding: 12,
  },
  small: {
    padding: 8,
  },

  // Disabled
  disabled: {
    backgroundColor: '#ccc',
    borderColor: '#ccc',
  },

  // Text styles
  baseText: {
    fontWeight: '600',
  },
  primaryText: {
    color: '#fff',
    fontSize: 16,
  },
  secondaryText: {
    color: '#4CAF50',
    fontSize: 16,
  },
  textText: {
    color: '#4CAF50',
    fontSize: 14,
  },
  dangerText: {
    color: '#ff4444',
    fontSize: 14,
  },
  ghostText: {
    color: '#999',
    fontSize: 14,
  },

  // Size text
  largeText: {
    fontSize: 16,
  },
  mediumText: {
    fontSize: 15,
  },
  smallText: {
    fontSize: 14,
  },

  disabledText: {
    color: '#999',
  },
});
