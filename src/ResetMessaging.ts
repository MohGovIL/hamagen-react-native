import { Vibration } from 'react-native';
import { initLocalHeadless } from './actions/LocaleActions';
import { initConfig } from './config/config';
import { scheduleTask } from './services/BackgroundService';
import { initBLETracing } from './services/BLEService';
import { startLocationTracking } from './services/LocationService';
import log from './services/LogService';

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

    await initBLETracing();
  } catch (error) {
    console.log(error);
  }
};

export default ResetMessaging;
