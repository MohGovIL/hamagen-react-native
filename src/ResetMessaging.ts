import { Vibration } from 'react-native';
import BackgroundFetch from 'react-native-background-fetch';
import BackgroundGeolocation from 'react-native-background-geolocation';
import { startLocationTracking } from './services/LocationService';
import { scheduleTask } from './services/BackgroundService';
import { initLocalHeadless } from './actions/LocaleActions';
import log from './services/LogService';
import { getModel } from 'react-native-device-info';
import AsyncStorage from '@react-native-community/async-storage';
import config, { initConfig } from './config/config';
import { initBLETracing } from './services/BLEService';
import { USER_AGREE_TO_BLE } from './constants/Constants';

const ResetMessaging = async (fromLoad: boolean = true) => {
  try {
    if (fromLoad) {
      await log('silent push notification headless');

      // vibrate toast for Debugging sake
      Vibration.vibrate(1500);
      await initConfig();
    }

    await scheduleTask();

    const { locale, notificationData } = await initLocalHeadless();

    await startLocationTracking(locale, notificationData);

    // check if phone got added to the BLE ban list
    if (config && config().BLEDisabledDevicesName.includes(getModel().toLowerCase())) {
      await AsyncStorage.setItem(USER_AGREE_TO_BLE, 'false');
    } else {
      await initBLETracing();
    }
  } catch (error) {
    console.log(error);
  }
};

export default ResetMessaging;
