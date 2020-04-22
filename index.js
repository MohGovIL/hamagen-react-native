import 'react-native-gesture-handler'; // required to fix an unhandled event due to the asynchronous router
import { AppRegistry } from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
import BackgroundFetch from 'react-native-background-fetch';
import BackgroundGeolocation from 'react-native-background-geolocation';
import moment from 'moment';
import App from './src/App';
import { name as appName } from './app.json';
import { checkSickPeople } from './src/services/Tracker';
import { syncLocationsDBOnLocationEvent } from './src/services/SampleService';
import { onError } from './src/services/ErrorService';
import { initConfig } from './src/config/config';
import { SERVICE_TRACKER } from './src/constants/Constants';

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

    const res = JSON.parse(await AsyncStorage.getItem(SERVICE_TRACKER) || '[]');
    await AsyncStorage.setItem(SERVICE_TRACKER, JSON.stringify([...res, { source: 'checkSickPeople - headless', timestamp: moment().valueOf() }]));

    await initConfig();
    await checkSickPeople();

    BackgroundFetch.finish(taskId);
  } catch (error) {
    onError({ error });
  }
};

const BackgroundGeolocationHeadlessTask = async (event) => {
  console.log('[BackgroundGeolocation HeadlessTask] -', event.name);

  const res = JSON.parse(await AsyncStorage.getItem(SERVICE_TRACKER) || '[]');
  await AsyncStorage.setItem(SERVICE_TRACKER, JSON.stringify([...res, { source: 'BGLocation - headless', timestamp: moment().valueOf() }]));

  await syncLocationsDBOnLocationEvent();
};

AppRegistry.registerComponent(appName, () => App);
BackgroundFetch.registerHeadlessTask(BackgroundFetchHeadlessTask);
BackgroundGeolocation.registerHeadlessTask(BackgroundGeolocationHeadlessTask);
