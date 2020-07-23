import { getModel } from 'react-native-device-info';
import AsyncStorage from '@react-native-community/async-storage';
import { startLocationTracking } from './services/LocationService';
import { scheduleTask } from './services/BackgroundService';
import { initLocalHeadless } from './actions/LocaleActions';
import config, { initConfig } from './config/config';
import { initBLETracing } from './services/BLEService';
import { USER_AGREE_TO_BLE } from './constants/Constants';

const ResetMessaging = async (fromLoad: boolean = true) => {
  console.log('data message received');
  try {
    if (fromLoad) {
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
