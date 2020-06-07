import { Vibration } from 'react-native';
import BackgroundFetch from 'react-native-background-fetch';
import { startLocationTracking } from './services/LocationService';
import { initLocalHeadless } from './actions/LocaleActions';
import log from './services/LogService';

const ResetMessaging = async () => {
  await log("firebase message")
  // vibrate toast for Debugging sake
  Vibration.vibrate(3000);

  try {
    await BackgroundFetch.stop();
    await BackgroundFetch.start();

    const { locale, notificationData } = await initLocalHeadless();
    await startLocationTracking(locale, notificationData);
  } catch (error) {
    console.log(error);
  }
};

export default ResetMessaging;