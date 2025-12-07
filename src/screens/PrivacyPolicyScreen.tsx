import React from 'react';
import { StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';
import { SafeAreaView } from 'react-native-safe-area-context';

interface Props {
  onBack?: () => void;
}

export const PrivacyPolicyScreen: React.FC<Props> = () => {
  // GitHub Pages URL - /docs 폴더가 루트로 설정됨
  const privacyPolicyUrl = 'https://hyuunw00.github.io/know-yourself/privacy-policy.html';

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
