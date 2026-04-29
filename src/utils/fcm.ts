import messaging from '@react-native-firebase/messaging';
import { Platform, PermissionsAndroid } from 'react-native';

async function requestPermission(): Promise<boolean> {
  if (Platform.OS === 'android') {
    if (Platform.Version >= 33) {
      const result = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
      );
      return result === PermissionsAndroid.RESULTS.GRANTED;
    }
    return true;
  }
  const status = await messaging().requestPermission();
  return (
    status === messaging.AuthorizationStatus.AUTHORIZED ||
    status === messaging.AuthorizationStatus.PROVISIONAL
  );
}

export async function getFCMToken(): Promise<string | null> {
  try {
    const granted = await requestPermission();
    if (!granted) {
      console.warn('[FCM] Permission not granted');
      return null;
    }
    const token = await messaging().getToken();
    console.log('[FCM] Token:', token);
    return token;
  } catch (err) {
    console.error('[FCM] Failed to get token:', err);
    return null;
  }
}

export function registerForegroundListener(
  onMessage?: (remoteMessage: any) => void
): () => void {
  return messaging().onMessage(remoteMessage => {
    console.log('[FCM] Foreground message:', JSON.stringify(remoteMessage, null, 2));
    if (onMessage) onMessage(remoteMessage);
  });
}

export function setBackgroundMessageHandler(): void {
  messaging().setBackgroundMessageHandler(async remoteMessage => {
    console.log('[FCM] Background message:', JSON.stringify(remoteMessage, null, 2));
  });
}