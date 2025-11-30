import messaging from '@react-native-firebase/messaging';
import { Platform, Alert, PermissionsAndroid } from 'react-native';
import { supabase } from './supabase';

/**
 * FCM 권한 요청 및 토큰 가져오기
 */
export const requestPushPermission = async (): Promise<boolean> => {
  try {
    // Android 13+ (API 33+)에서는 런타임 권한 요청 필요
    if (Platform.OS === 'android' && Platform.Version >= 33) {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
      );

      if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
        console.log('푸시 알림 권한 거부됨');
        return false;
      }
    }

    // iOS 또는 Android < 13에서는 Firebase 권한 요청
    const authStatus = await messaging().requestPermission();
    const enabled =
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL;

    if (enabled) {
      console.log('푸시 알림 권한 승인됨');
      return true;
    } else {
      console.log('푸시 알림 권한 거부됨');
      return false;
    }
  } catch (error) {
    console.error('푸시 알림 권한 요청 실패:', error);
    return false;
  }
};

/**
 * FCM 토큰 가져오기
 */
export const getFCMToken = async (): Promise<string | null> => {
  try {
    // iOS에서는 원격 메시지 등록이 필요
    if (Platform.OS === 'ios') {
      await messaging().registerDeviceForRemoteMessages();
    }

    const token = await messaging().getToken();
    console.log('FCM 토큰:', token);
    return token;
  } catch (error) {
    console.error('FCM 토큰 가져오기 실패:', error);
    return null;
  }
};

/**
 * FCM 토큰을 DB에 저장
 */
export const saveFCMToken = async (
  userId: string,
  token: string,
): Promise<boolean> => {
  try {
    const platform = Platform.OS as 'ios' | 'android';

    // 기존 토큰 삭제 후 새 토큰 저장 (유저당 하나의 토큰만 유지)
    await supabase.from('push_tokens').delete().eq('user_id', userId);

    const { error } = await supabase
      .from('push_tokens')
      .insert({
        user_id: userId,
        token,
        platform,
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error('FCM 토큰 저장 실패:', error);
      return false;
    }

    console.log('FCM 토큰 저장 성공');
    return true;
  } catch (error) {
    console.error('FCM 토큰 저장 중 오류:', error);
    return false;
  }
};

/**
 * FCM 토큰 삭제 (로그아웃 시)
 */
export const deleteFCMToken = async (
  userId: string,
  token: string,
): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('push_tokens')
      .delete()
      .eq('user_id', userId)
      .eq('token', token);

    if (error) {
      console.error('FCM 토큰 삭제 실패:', error);
      return false;
    }

    console.log('FCM 토큰 삭제 성공');
    return true;
  } catch (error) {
    console.error('FCM 토큰 삭제 중 오류:', error);
    return false;
  }
};

/**
 * FCM 초기화 및 토큰 등록
 */
export const initializeFCM = async (
  userId: string,
): Promise<(() => void) | undefined> => {
  try {
    // 1. 권한 요청
    const hasPermission = await requestPushPermission();
    if (!hasPermission) {
      console.log('푸시 알림 권한이 없어 초기화를 건너뜁니다.');
      return;
    }

    // 2. 토큰 가져오기
    const token = await getFCMToken();
    if (!token) {
      console.error('FCM 토큰을 가져올 수 없습니다.');
      return;
    }

    // 3. 토큰 저장
    await saveFCMToken(userId, token);

    // 4. 토큰 갱신 리스너
    // @ts-ignore - Firebase v23에서 deprecated 경고가 있지만 작동함
    const unsubscribe = messaging().onTokenRefresh(async (newToken: string) => {
      console.log('FCM 토큰 갱신:', newToken);
      await saveFCMToken(userId, newToken);
    });

    return unsubscribe;
  } catch (error) {
    console.error('FCM 초기화 실패:', error);
  }
};

/**
 * 포그라운드 메시지 리스너 설정
 */
export const setupForegroundMessageHandler = () => {
  const unsubscribe = messaging().onMessage(async remoteMessage => {
    console.log('포그라운드 메시지 수신:', remoteMessage);

    // 포그라운드에서도 알림 표시
    if (remoteMessage.notification) {
      Alert.alert(
        remoteMessage.notification.title || '알림',
        remoteMessage.notification.body || '',
        [{ text: '확인' }],
      );
    }
  });

  return unsubscribe;
};

/**
 * 백그라운드 메시지 핸들러 설정
 * (index.js에서 호출되어야 함)
 */
export const setupBackgroundMessageHandler = () => {
  messaging().setBackgroundMessageHandler(async remoteMessage => {
    console.log('백그라운드 메시지 수신:', remoteMessage);
  });
};

/**
 * 알림 클릭 리스너 설정
 */
export const setupNotificationOpenedListener = (
  callback: (remoteMessage: any) => void,
) => {
  // 앱이 백그라운드에 있을 때 알림 클릭
  messaging().onNotificationOpenedApp(remoteMessage => {
    console.log('백그라운드에서 알림 클릭:', remoteMessage);
    callback(remoteMessage);
  });

  // 앱이 종료된 상태에서 알림 클릭
  messaging()
    .getInitialNotification()
    .then(remoteMessage => {
      if (remoteMessage) {
        console.log('종료 상태에서 알림 클릭:', remoteMessage);
        callback(remoteMessage);
      }
    });
};
