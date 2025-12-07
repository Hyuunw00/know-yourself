import React from 'react';
import { StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';
import { SafeAreaView } from 'react-native-safe-area-context';

interface Props {
  onBack?: () => void;
}

export const PrivacyPolicyScreen: React.FC<Props> = () => {
  // GitHub Pages URL (저장소에 푸시 후 활성화 필요)
  // GitHub Pages 활성화 전: raw.githubusercontent.com 사용
  const privacyPolicyUrl = 'https://raw.githubusercontent.com/Hyuunw00/know-yourself/main/docs/privacy-policy.html';

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
