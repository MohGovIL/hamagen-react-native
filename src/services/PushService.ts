import messaging from '@react-native-firebase/messaging';
import { Notifications } from 'react-native-notifications';
import { onError } from './ErrorService';

export const initPushNotifications = () => new Promise(async (resolve) => {
  try {
    const authStatus = await messaging().hasPermission();
    const enabled = authStatus === messaging.AuthorizationStatus.AUTHORIZED || authStatus === messaging.AuthorizationStatus.PROVISIONAL;

    if (!enabled) {
      try {
        await messaging().requestPermission();
      } catch (error) {
        onError({ error });
        return resolve();
      }
    }

    resolve();
  } catch (error) {
    resolve();
    onError({ error });
  }
});

export const registerLocalNotification = async (title: string, message: string) => {
  try {
    await initPushNotifications();

    Notifications.postLocalNotification({
      title,
      body: message,
      badge: 0,
      identifier: 'localPush',
      payload: {},
      sound: '',
      thread: '',
      type: 'localPush'
    }, 0);
  } catch (error) {
    onError({ error });
  }
};
