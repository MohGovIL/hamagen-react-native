import 'react-native-gesture-handler'; // required to fix an unhandled event due to the asynchronous router
import { AppRegistry } from 'react-native';
import BackgroundFetch from 'react-native-background-fetch';
import BackgroundGeolocation from 'react-native-background-geolocation';
import App from './src/App';
import { name as appName } from './app.json';
import ResetMessaging from './src/ResetMessaging';
import { checkGeoSickPeople, checkBLESickPeople } from './src/services/Tracker';
import { syncLocationsDBOnLocationEvent } from './src/services/SampleService';
import { onError } from './src/services/ErrorService';
import { initBLETracing } from './src/services/BLEService';
import { initConfig } from './src/config/config';
import { IS_IOS } from './src/constants/Constants';


BackgroundGeolocation.onLocation(
  async () => {
    await syncLocationsDBOnLocationEvent();

    if (IS_IOS) {
      await initBLETracing();
    }
  }, (error) => {
    onError({ error });
  }
);

const BackgroundFetchHeadlessTask = async (event) => {
  try {
    const { taskId } = event;
    console.log('[BackgroundFetch HeadlessTask] start: ', taskId);

    if (IS_IOS) {
      initBLETracing();
    }
    
    await initConfig();
    await syncLocationsDBOnLocationEvent();
    await checkBLESickPeople();
    await checkGeoSickPeople();

    BackgroundFetch.finish(taskId);
  } catch (error) {
    onError({ error });
  }
};

const BackgroundGeolocationHeadlessTask = async (event) => {
  console.log('[BackgroundGeolocation HeadlessTask] -', event.name);
  await syncLocationsDBOnLocationEvent();
};

AppRegistry.registerComponent(appName, () => App);
AppRegistry.registerHeadlessTask('RNFirebaseBackgroundMessage', () => ResetMessaging);
BackgroundFetch.registerHeadlessTask(BackgroundFetchHeadlessTask);
BackgroundGeolocation.registerHeadlessTask(BackgroundGeolocationHeadlessTask);
