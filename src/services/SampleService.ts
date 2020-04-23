import geoHash from 'latlon-geohash';
import AsyncStorage from '@react-native-community/async-storage';
import AsyncLock from 'async-lock';
import moment from 'moment';
import BackgroundGeolocation from 'react-native-background-geolocation';
import { startLocationTracking } from './LocationService';
import { UserLocationsDatabase } from '../database/Database';
import { sha256 } from './sha256';
import { onError } from './ErrorService';
import store from '../store';
import config, { initConfig } from '../config/config';
import { NotificationData } from '../locale/LocaleData';
import { DBLocation, Sample, VelocityRecord } from '../types';
import { UPDATE_FIRST_POINT } from '../constants/ActionTypes';
import {
  FIRST_POINT_TS,
  HIGH_VELOCITY_POINTS,
  IS_LAST_POINT_FROM_TIMELINE,
  LAST_POINT_START_TIME
} from '../constants/Constants';

// tslint:disable-next-line:no-var-requires
const haversine = require('haversine');

const lock = new AsyncLock();

export const startSampling = async (locale: string, notificationData: NotificationData) => {
  await startLocationTracking(locale, notificationData);
};

export const syncLocationsDBOnLocationEvent = async () => {
  // prevent race condition of entering multiple points at the same time
  await lock.acquire('syncLocationsDBOnLocationEvent', async (done) => {
    try {
      await initConfig();

      // @ts-ignore
      const rawLocations: Sample[] = await BackgroundGeolocation.getLocations();
      await BackgroundGeolocation.destroyLocations();

      const locations = rawLocations.map(location => ({
        ...location,
        timestamp: moment(location.timestamp).valueOf()
      }));

      for (const location of locations) {
        await updateDBAccordingToSampleVelocity(location);
      }

      done();
    } catch (error) {
      done();
      onError({ error });
    }
  });
};

export const insertDB = async (sample: Sample) => new Promise(async (resolve) => {
  try {
    // save first point timestamp (if needed), displayed in the main screen.
    const firstPointTS = await hasFirstPointTimestamp();

    if (!firstPointTS) {
      store().dispatch({ type: UPDATE_FIRST_POINT, payload: sample.timestamp });
      await saveToStorage(FIRST_POINT_TS, sample.timestamp);
    }

    // check last point timestamp and ignore if same point entered again.
    const lastPointStartTime = await hasLastPointTimestamp();

    if (lastPointStartTime && (lastPointStartTime === sample.timestamp)) {
      resolve();
      return true;
    }

    await saveToStorage(LAST_POINT_START_TIME, sample.timestamp);

    const db = new UserLocationsDatabase();

    const isLastPointFromTimeline = await AsyncStorage.getItem(IS_LAST_POINT_FROM_TIMELINE);

    if (!isLastPointFromTimeline) {
      await db.updateLastSampleEndTime(sample.timestamp);
    } else {
      await AsyncStorage.removeItem(IS_LAST_POINT_FROM_TIMELINE);
    }

    const sampleObj = {
      lat: sample.coords.latitude,
      long: sample.coords.longitude,
      accuracy: sample.coords.accuracy,
      startTime: sample.timestamp,
      endTime: sample.timestamp,
      geoHash: geoHash.encode(sample.coords.latitude, sample.coords.longitude),
      wifiHash: ''
    };

    const finalSample: DBLocation = { ...sampleObj, hash: sha256(JSON.stringify(sampleObj)) };

    await db.addSample(finalSample);

    resolve(true);
    return true;
  } catch (error) {
    resolve();
    onError({ error });
  }
});

const hasFirstPointTimestamp = () => new Promise(async (resolve) => {
  try {
    resolve(JSON.parse(await AsyncStorage.getItem(FIRST_POINT_TS) || 'false'));
  } catch (error) {
    resolve(false);
    onError({ error });
  }
});

const hasLastPointTimestamp = () => new Promise<number|boolean>(async (resolve) => {
  try {
    resolve(JSON.parse(await AsyncStorage.getItem(LAST_POINT_START_TIME) || 'false'));
  } catch (error) {
    resolve(false);
    onError({ error });
  }
});

const saveToStorage = (key: string, value: number) => new Promise(async (resolve) => {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
    resolve();
  } catch (error) {
    resolve();
    onError({ error });
  }
});

export const purgeSamplesDB = () => new Promise(async (resolve, reject) => {
  const NUM_OF_WEEKS_TO_PURGE = 2;

  try {
    await lock.acquire('purgeDB', async (done) => {
      const db = new UserLocationsDatabase();

      await db.purgeSamplesTable(moment().subtract(NUM_OF_WEEKS_TO_PURGE, 'week').unix() * 1000);

      resolve();
      done();
      return true;
    });
  } catch (error) {
    reject(error);
    onError({ error });
  }
});

export const updateDBAccordingToSampleVelocity = async (location: Sample) => {
  // prevent race condition of entering multiple points at the same time
  await lock.acquire('updateDBAccordingToSampleVelocity', async (done) => {
    try {
      const { is_moving, activity: { confidence }, coords: { speed } } = location;

      const db = new UserLocationsDatabase();

      const highVelocityPoints = JSON.parse(await AsyncStorage.getItem(HIGH_VELOCITY_POINTS) || '[]');

      const lastPointFromDB = await db.getLastPointEntered();
      const lastPointFromHVP = highVelocityPoints[highVelocityPoints.length - 1];

      // ignore locations with timestamp earlier then the last location saved
      if ((lastPointFromHVP && (lastPointFromHVP.timestamp > location.timestamp)) || (lastPointFromDB && (lastPointFromDB.startTime > location.timestamp))) {
        done();
        return;
      }

      const isLastPointEndTimeUpdated = JSON.parse(await AsyncStorage.getItem(IS_LAST_POINT_FROM_TIMELINE) || 'false');

      if (is_moving && (speed > config().locationServiceIgnoreSampleVelocityThreshold) && (confidence > config().locationServiceIgnoreConfidenceThreshold)) {
        if (!isLastPointEndTimeUpdated) {
          await db.updateLastSampleEndTime(location.timestamp);
          await AsyncStorage.setItem(IS_LAST_POINT_FROM_TIMELINE, 'true'); // raise this flag to prevent next point to override the previous point endTime
        }
        done();
        return;
      }

      let pointsToCheck;

      if (highVelocityPoints.length === 0) {
        // in case this is the first point entered
        if (!lastPointFromDB) {
          await insertDB(location);
          done();
          return;
        }

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
        if (highVelocityPoints.length === 0 && !isLastPointEndTimeUpdated) {
          await db.updateLastSampleEndTime(location.timestamp);
          await AsyncStorage.setItem(IS_LAST_POINT_FROM_TIMELINE, 'true'); // raise this flag to prevent next point to override the previous point endTime
        }
        await AsyncStorage.setItem(HIGH_VELOCITY_POINTS, JSON.stringify([...highVelocityPoints, location]));
      } else {
        await AsyncStorage.removeItem(HIGH_VELOCITY_POINTS);
        await insertDB(location);
      }
      done();
    } catch (error) {
      onError({ error });
      done();
    }
  });
};

const evalVelocity = (myData: Sample[]) => {
  const velRec: VelocityRecord[] = mapPairs(myData, (a, b) => evalVelocity2Loc(a, b));

  return velRec[velRec.length - 1].velocity > config().locationServiceIgnoreSampleVelocityThreshold;
};

function mapPairs<T, U>(array: T[], fn: (first: T, second: T, index: number) => U): U[] {
  if (array.length === 0) {
    throw new Error('No pairs in empty array');
  }

  const ret: U[] = [];

  for (let i = 0; i < array.length - 1; i++) {
    ret.push(fn(array[i], array[i + 1], i));
  }

  return ret;
}

const evalVelocity2Loc = (prevData: Sample, currData: Sample) => {
  const distMeter = haversine(
    { latitude: currData.coords.latitude, longitude: currData.coords.longitude },
    { latitude: prevData.coords.latitude, longitude: prevData.coords.longitude },
    { unit: config().bufferUnits }
  );

  const timeDiffInSeconds = Math.floor((currData.timestamp - prevData.timestamp) / 1000);

  const velocity = (timeDiffInSeconds > 0) ? distMeter / timeDiffInSeconds : 0;

  return { distMeter, timeDiff: timeDiffInSeconds, velocity };
};
