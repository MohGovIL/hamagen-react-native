import BackgroundFetch from 'react-native-background-fetch';
import BackgroundGeolocation from 'react-native-background-geolocation';
import { startLocationTracking } from './services/LocationService';
import { scheduleTask } from './services/BackgroundService';
import { initLocalHeadless } from './actions/LocaleActions';
import { initConfig } from './config/config';
import { initBLETracing } from './services/BLEService';

const ResetMessaging = async () => {
  console.log('data message received');
  try {
    await BackgroundFetch.stop();

    await initConfig();
    await scheduleTask();

    const { locale, notificationData } = await initLocalHeadless();
    await BackgroundGeolocation.stop();
    await startLocationTracking(locale, notificationData);

    await initBLETracing()
  } catch (error) {
    console.log(error);
  }
};

export default ResetMessaging;
