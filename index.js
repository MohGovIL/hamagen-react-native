import 'react-native-gesture-handler'; // required to fix an unhandled event due to the asynchronous router
import { AppRegistry } from 'react-native';
import moment from 'moment';
import BackgroundFetch from 'react-native-background-fetch';
import BackgroundGeolocation from 'react-native-background-geolocation';
import App from './src/App';
import { name as appName } from './app.json';
import { updateDBAccordingToSampleVelocity } from './src/services/SampleService';
import { checkSickPeople } from './src/services/Tracker';
import { onError } from './src/services/ErrorService';
import { initConfig } from './src/config/config';

BackgroundGeolocation.onLocation(
  async (location) => {
    try {
      location.timestamp = moment(location.timestamp).valueOf();
      await initConfig();
      await updateDBAccordingToSampleVelocity(location);
    } catch (error) {
      onError({ error });
    }
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

const BackgroundGeolocationHeadlessTask = async (event, params) => {
  console.log('[BackgroundGeolocation HeadlessTask] -', event.name, params);
};

AppRegistry.registerComponent(appName, () => App);
BackgroundFetch.registerHeadlessTask(BackgroundFetchHeadlessTask);
BackgroundGeolocation.registerHeadlessTask(BackgroundGeolocationHeadlessTask);
