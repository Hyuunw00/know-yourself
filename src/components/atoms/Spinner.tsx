import React from 'react';
import { ActivityIndicator, View, StyleSheet, ViewStyle } from 'react-native';

type SpinnerSize = 'small' | 'large';
type SpinnerColor = 'primary' | 'white';

interface SpinnerProps {
  size?: SpinnerSize;
  color?: SpinnerColor;
  fullScreen?: boolean;
  style?: ViewStyle;
}

export const Spinner = ({
  size = 'large',
  color = 'primary',
  fullScreen = false,
  style,
}: SpinnerProps) => {
  const indicatorColor = color === 'primary' ? '#4CAF50' : '#fff';

  if (fullScreen) {
    return (
      <View style={[styles.fullScreen, style]}>
        <ActivityIndicator size={size} color={indicatorColor} />
      </View>
    );
  }

  return <ActivityIndicator size={size} color={indicatorColor} style={style} />;
};

const styles = StyleSheet.create({
  fullScreen: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
