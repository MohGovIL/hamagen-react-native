import 'react-native-gesture-handler'; // required to fix an unhandled event due to the asynchronous router
import { AppRegistry } from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
import BackgroundFetch from 'react-native-background-fetch';
import BackgroundGeolocation from 'react-native-background-geolocation';
import moment from 'moment';
import App from './src/App';
import { name as appName } from './app.json';
import ResetMessaging from './src/ResetMessaging';
import { checkGeoSickPeople } from './src/services/Tracker';
import { syncLocationsDBOnLocationEvent } from './src/services/SampleService';
import { onError } from './src/services/ErrorService';
import { initConfig } from './src/config/config';
import { SERVICE_TRACKER } from './src/constants/Constants';
import log from './src/services/LogService';

BackgroundGeolocation.onLocation(
  async () => {
    const res = JSON.parse(await AsyncStorage.getItem(SERVICE_TRACKER) || '[]');
    await AsyncStorage.setItem(SERVICE_TRACKER, JSON.stringify([...res, { source: 'BGLocation - onLocation', timestamp: moment().valueOf() }]));

    await syncLocationsDBOnLocationEvent();
  }, (error) => {
    onError({ error });
  }
);

const BackgroundFetchHeadlessTask = async (event) => {
  try {
    const { taskId } = event;
    console.log('[BackgroundFetch HeadlessTask] start: ', taskId);

    await log('BackgroundFetch Headless');

    await initConfig();
    await checkGeoSickPeople();

    BackgroundFetch.finish(taskId);
  } catch (error) {
    onError({ error });
  }
};

const BackgroundGeolocationHeadlessTask = async (event) => {
  console.log('[BackgroundGeolocation HeadlessTask] -', event.name);

  await log('BGLocation Headless');

  await syncLocationsDBOnLocationEvent();
};

AppRegistry.registerComponent(appName, () => App);
AppRegistry.registerHeadlessTask('RNFirebaseBackgroundMessage', () => ResetMessaging);
BackgroundFetch.registerHeadlessTask(BackgroundFetchHeadlessTask);
BackgroundGeolocation.registerHeadlessTask(BackgroundGeolocationHeadlessTask);
