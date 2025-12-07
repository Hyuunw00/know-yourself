import React from 'react';
import { StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';
import { SafeAreaView } from 'react-native-safe-area-context';

interface Props {
  onBack?: () => void;
}

export const PrivacyPolicyScreen: React.FC<Props> = () => {
  // GitHub Pages URL - HTML이 제대로 렌더링되어 표시됨
  const privacyPolicyUrl = 'https://hyuunw00.github.io/know-yourself/docs/privacy-policy.html';

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <WebView
        source={{ uri: privacyPolicyUrl }}
        style={styles.webview}
        startInLoadingState={true}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  webview: {
    flex: 1,
  },
});
