import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '@/stores';

export const AuthScreen = () => {
  const [isLogin, setIsLogin] = useState(true); // true: 로그인, false: 회원가입
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [waitingVerification, setWaitingVerification] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false); // 서비스 이용약관 동의
  const [agreedToPrivacy, setAgreedToPrivacy] = useState(false); // 개인정보 처리방침 동의
  const [isOver14, setIsOver14] = useState(false); // 만 14세 이상 확인
  const { login, signup, isLoading } = useAuthStore();

  const handleSubmit = async () => {
    if (!email || !password) {
      Alert.alert('알림', '이메일과 비밀번호를 입력해주세요.');
      return;
    }

    if (password.length < 6) {
      Alert.alert('알림', '비밀번호는 6자 이상이어야 합니다.');
      return;
    }

    // 회원가입 시 필수 동의 확인
    if (!isLogin) {
      if (!isOver14) {
        Alert.alert('알림', '만 14세 이상만 가입할 수 있습니다.');
        return;
      }
      if (!agreedToTerms) {
        Alert.alert('알림', '서비스 이용약관에 동의해주세요.');
        return;
      }
      if (!agreedToPrivacy) {
        Alert.alert('알림', '개인정보 처리방침에 동의해주세요.');
        return;
      }
    }

    const { error } = isLogin
      ? await login(email, password)
      : await signup(email, password);

    if (error) {
      Alert.alert('오류', error);
    } else if (!isLogin) {
      setWaitingVerification(true);
    }
  };

  // 이메일 인증 대기 화면
  if (waitingVerification) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.inner}>
          <View style={styles.header}>
            <Text style={styles.title}>이메일 인증</Text>
            <Text style={styles.subtitle}>
              {email}로 인증 메일을 보냈습니다.{'\n'}
              이메일을 확인하고 인증을 완료해주세요.
            </Text>
          </View>

          <TouchableOpacity
            style={styles.button}
            onPress={() => {
              setWaitingVerification(false);
              setIsLogin(true);
            }}
          >
            <Text style={styles.buttonText}>로그인하기</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.inner}
      >
        {/* 헤더 */}
        <View style={styles.header}>
          <Text style={styles.title}>Know Yourself</Text>
          <Text style={styles.subtitle}>매일 기록하며 나를 알아가요</Text>
        </View>

        {/* 폼 */}
        <View style={styles.form}>
          <TextInput
            style={styles.input}
            placeholder="이메일"
            placeholderTextColor="#999"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <TextInput
            style={styles.input}
            placeholder="비밀번호"
            placeholderTextColor="#999"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          {/* 회원가입 시 필수 동의 항목 */}
          {!isLogin && (
            <View style={styles.agreementSection}>
              {/* 만 14세 이상 확인 */}
              <TouchableOpacity
                style={styles.checkboxContainer}
                onPress={() => setIsOver14(!isOver14)}
              >
                <View style={styles.checkbox}>
                  {isOver14 && <View style={styles.checkboxChecked} />}
                </View>
                <Text style={styles.checkboxLabel}>
                  만 14세 이상입니다 (필수)
                </Text>
              </TouchableOpacity>

              {/* 서비스 이용약관 동의 */}
              <TouchableOpacity
                style={styles.checkboxContainer}
                onPress={() => setAgreedToTerms(!agreedToTerms)}
              >
                <View style={styles.checkbox}>
                  {agreedToTerms && <View style={styles.checkboxChecked} />}
                </View>
                <Text style={styles.checkboxLabel}>
                  <Text
                    style={styles.privacyLink}
                    onPress={() =>
                      Linking.openURL(
                        'https://hyuunw00.github.io/know-yourself/terms-of-service.html',
                      )
                    }
                  >
                    서비스 이용약관
                  </Text>
                  에 동의합니다 (필수)
                </Text>
              </TouchableOpacity>

              {/* 개인정보 처리방침 동의 */}
              <TouchableOpacity
                style={styles.checkboxContainer}
                onPress={() => setAgreedToPrivacy(!agreedToPrivacy)}
              >
                <View style={styles.checkbox}>
                  {agreedToPrivacy && <View style={styles.checkboxChecked} />}
                </View>
                <Text style={styles.checkboxLabel}>
                  <Text
                    style={styles.privacyLink}
                    onPress={() =>
                      Linking.openURL(
                        'https://hyuunw00.github.io/know-yourself/privacy-policy.html',
                      )
                    }
                  >
                    개인정보 처리방침
                  </Text>
                  에 동의합니다 (필수)
                </Text>
              </TouchableOpacity>
            </View>
          )}

          <TouchableOpacity
            style={styles.button}
            onPress={handleSubmit}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>
                {isLogin ? '로그인' : '회원가입'}
              </Text>
            )}
          </TouchableOpacity>
        </View>

        {/* 전환 링크 */}
        <TouchableOpacity onPress={() => setIsLogin(!isLogin)}>
          <Text style={styles.switchText}>
            {isLogin
              ? '계정이 없으신가요? 회원가입'
              : '이미 계정이 있으신가요? 로그인'}
          </Text>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  inner: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  form: {
    marginBottom: 20,
  },
  input: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  agreementSection: {
    marginTop: 8,
    marginBottom: 8,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    marginTop: 8,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#4CAF50',
    marginRight: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    width: 12,
    height: 12,
    borderRadius: 2,
    backgroundColor: '#4CAF50',
  },
  checkboxLabel: {
    fontSize: 14,
    color: '#333',
    flex: 1,
  },
  privacyLink: {
    color: '#4CAF50',
    textDecorationLine: 'underline',
  },
  button: {
    backgroundColor: '#4CAF50',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  switchText: {
    textAlign: 'center',
    color: '#4CAF50',
    fontSize: 14,
  },
  privacyContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  privacyText: {
    fontSize: 12,
    color: '#999',
    textDecorationLine: 'underline',
  },
});
