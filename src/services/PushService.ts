import firebase from 'react-native-firebase';
import moment, { DurationInputArg1, DurationInputArg2 } from 'moment';
import { onError } from './ErrorService';

export const initPushNotifications = () => new Promise(async (resolve) => {
  try {
    const enabled = await firebase.messaging().hasPermission();

    if (!enabled) {
      try {
        await firebase.messaging().requestPermission();
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

export const registerLocalNotification = async (title: string, message: string, sendInAmount: DurationInputArg1, sendInUnits: DurationInputArg2) => {
  try {
    await initPushNotifications();

    // Build a channel
    const channel = new firebase.notifications.Android.Channel('LocalPush', 'CHANNEL_NAME', firebase.notifications.Android.Importance.Max,)
      .setSound('default')
      .enableVibration(true)
      .setVibrationPattern([100, 100, 100, 100]);

    // Create the channel
    await firebase.notifications().android.createChannel(channel);

    const notification = new firebase.notifications.Notification()
      .setNotificationId('LocalPush')
      .setTitle(title)
      .setBody(message)
      .setSound('default');

    notification
      .android.setChannelId('LocalPush')
      .android.setSmallIcon('ic_launcher')
      .android.setAutoCancel(true)
      .android.setVibrate([100, 100, 100, 100]);

    const fireDate = moment().add(sendInAmount, sendInUnits).valueOf();
    await firebase.notifications().scheduleNotification(notification, { fireDate });
  } catch (error) {
    onError({ error });
  }
};
