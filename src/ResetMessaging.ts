import { initLocalHeadless } from './actions/LocaleActions';
import { initConfig } from './config/config';
import { scheduleTask } from './services/BackgroundService';
import { initBLETracing } from './services/BLEService';
import { startLocationTracking } from './services/LocationService';

const ResetMessaging = async (fromLoad: boolean = true) => {
  try {
    if (fromLoad) {
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
