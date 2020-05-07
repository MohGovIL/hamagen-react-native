import 'react-native-gesture-handler'; // required to fix an unhandled event due to the asynchronous router
import { AppRegistry } from 'react-native';
import BackgroundFetch from 'react-native-background-fetch';
import BackgroundGeolocation from 'react-native-background-geolocation';
import App from './src/App';
import { name as appName } from './app.json';
import { checkSickPeople } from './src/services/Tracker';
import { syncLocationsDBOnLocationEvent } from './src/services/SampleService';
import { onError } from './src/services/ErrorService';
import { initConfig } from './src/config/config';

BackgroundGeolocation.onLocation(
  async () => {
    await syncLocationsDBOnLocationEvent();
  }, (error) => {
    onError({ error });
  }
);

const BackgroundFetchHeadlessTask = async (event) => {
  try {
    const { taskId } = event;
    console.log('[BackgroundFetch HeadlessTask] start: ', taskId);

    await initConfig();
    await checkSickPeople();

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
BackgroundFetch.registerHeadlessTask(BackgroundFetchHeadlessTask);
BackgroundGeolocation.registerHeadlessTask(BackgroundGeolocationHeadlessTask);
