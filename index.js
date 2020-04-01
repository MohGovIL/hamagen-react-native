import 'react-native-gesture-handler'; // required to fix an unhandled event due to the asynchronous router
import { AppRegistry } from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
import moment from 'moment';
import BackgroundFetch from 'react-native-background-fetch';
import BackgroundGeolocation from 'react-native-background-geolocation';
import App from './src/App';
import { name as appName } from './app.json';
import { checkSickPeople } from './src/services/Tracker';
import { onError } from './src/services/ErrorService';
import { UserLocationsDatabase } from './src/database/Database';
import { evalVelocity, insertDB } from './src/services/SampleService';
import { HIGH_VELOCITY_POINTS, IS_LAST_POINT_FROM_TIMELINE } from './src/constants/Constants';

BackgroundGeolocation.onLocation(
  async (location) => {
    const { type, confidence } = location.activity;

    location.timestamp = moment(location.timestamp).valueOf();
    const db = new UserLocationsDatabase();

    // TODO move to config
    if (['running', 'on_bicycle', 'in_vehicle'].includes(type) && (confidence > 80)) {
      await db.updateLastSampleEndTime(location.timestamp);
      await AsyncStorage.setItem(IS_LAST_POINT_FROM_TIMELINE, 'true'); // raise this flag to prevent next point to override the previous point endTime
      return;
    }

    const highVelocityPoints = JSON.parse(await AsyncStorage.getItem(HIGH_VELOCITY_POINTS) || '[]');
    let pointsToCheck;

    if (highVelocityPoints.length === 0) {
      const lastPointFromDB = await db.getLastPointEntered();
      pointsToCheck = [{
        coords: {
          latitude: lastPointFromDB.lat,
          longitude: lastPointFromDB.long,
          accuracy: lastPointFromDB.accuracy
        },
        timestamp: lastPointFromDB.endTime
      }];
    } else {
      pointsToCheck = highVelocityPoints;
    }

    const isHighVelocity = evalVelocity([...pointsToCheck, location]);

    if (isHighVelocity) {
      if (highVelocityPoints.length === 0) {
        await db.updateLastSampleEndTime(location.timestamp);
        await AsyncStorage.setItem(IS_LAST_POINT_FROM_TIMELINE, 'true'); // raise this flag to prevent next point to override the previous point endTime
      }
      await AsyncStorage.setItem(HIGH_VELOCITY_POINTS, JSON.stringify([...highVelocityPoints, location]));
    } else {
      await AsyncStorage.removeItem(HIGH_VELOCITY_POINTS);
      await insertDB(location);
    }
  }, (error) => {
    onError({ error });
  }
);

const BackgroundFetchHeadlessTask = async (event) => {
  try {
    const { taskId } = event;
    console.log('[BackgroundFetch HeadlessTask] start: ', taskId);

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
