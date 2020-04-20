import BackgroundTimer from 'react-native-background-timer';
import AsyncStorage from '@react-native-community/async-storage';
import moment from 'moment';
import { setExposures } from '../actions/ExposuresActions';
import { initLocale } from '../actions/LocaleActions';
import { UserLocationsDatabase, IntersectionSickDatabase } from '../database/Database';
import { registerLocalNotification } from './PushService';
import { downloadAndVerifySigning } from './SigningService';
import { onError } from './ErrorService';
import config from '../config/config';
import store from '../store';
import { Exposure, Location, SickJSON } from '../types';
import { LAST_FETCH_TS } from '../constants/Constants';

// tslint:disable-next-line:no-var-requires
const haversine = require('haversine');

export const startForegroundTimer = async () => {
  await checkSickPeople();

  BackgroundTimer.runBackgroundTimer(async () => {
    await checkSickPeople();
  }, config().fetchMilliseconds);
};

export const queryDB = async () => {
  const db = new UserLocationsDatabase();
  const rows = await db.listSamples();
  return rows;
};

export const checkSickPeople = async () => {
  try {
    const lastFetch = JSON.parse((await AsyncStorage.getItem(LAST_FETCH_TS)) || '0');

    // prevent excessive calls to checkSickPeople
    if (lastFetch && moment().valueOf() - lastFetch < config().fetchMilliseconds) {
      return;
    }

    const responseJson: SickJSON = await downloadAndVerifySigning(config().dataUrl_utc);
    const myData = await queryDB();

    const shouldFilterByGeohash = !!responseJson.features[0].properties.geohashFilter;
    const sickPeopleIntersected: any = shouldFilterByGeohash ? getIntersectingSickRecordsByGeoHash(myData, responseJson) : getIntersectingSickRecords(myData, responseJson);

    if (sickPeopleIntersected.length > 0) {
      await onSickPeopleNotify(sickPeopleIntersected);
    }

    await AsyncStorage.setItem(
      LAST_FETCH_TS,
      JSON.stringify(moment().valueOf()),
    );
  } catch (error) {
    onError(error);
  }
};

export const getIntersectingSickRecords = (myData: Location[], sickRecordsJson: SickJSON) => {
  const sickPeopleIntersected: any = [];

  if (myData.length === 0) {
    console.log('Could not find data');
  } else {
    // for each feature in json data
    sickRecordsJson.features.map((sickRecord: Exposure) => {
      // for each raw in user data
      myData.reverse().forEach((userRecord: Location) => {
        if (
          isTimeOverlapping(userRecord, sickRecord)
          && isSpaceOverlapping(userRecord, sickRecord)
        ) {
          // add sick people you intersects
          sickRecord.properties.fromTime_utc = Math.max(userRecord.startTime, sickRecord.properties.fromTime_utc);
          sickRecord.properties.toTime_utc = userRecord.endTime;
          sickPeopleIntersected.push(sickRecord);
        }
      });
    });
  }

  return sickPeopleIntersected;
};

export const getIntersectingSickRecordsByGeoHash = (myData: Location[], sickRecordsJson: SickJSON) => {
  const sickPeopleIntersected: any = [];

  if (myData.length === 0) {
    console.log('Could not find data');
  } else {
    const mappedLocations: {[key: string]: Location[]} = {};

    myData.forEach((location) => {
      const locationGeohashPrefix = location.geoHash.slice(0, sickRecordsJson.features[0].properties.geohashFilter.length);

      if (mappedLocations[locationGeohashPrefix]) {
        mappedLocations[locationGeohashPrefix].push(location);
      } else {
        mappedLocations[locationGeohashPrefix] = [location];
      }
    });

    // for each feature in json data
    sickRecordsJson.features.map((sickRecord: Exposure) => {
      const sickRecordGeohashPrefix = sickRecord.properties.geohashFilter;

      // for each raw in user data
      if (mappedLocations[sickRecordGeohashPrefix]) {
        mappedLocations[sickRecordGeohashPrefix].reverse().forEach((userRecord: Location) => {
          if (isTimeOverlapping(userRecord, sickRecord) && isSpaceOverlapping(userRecord, sickRecord)) {
            // add sick people you intersects
            sickRecord.properties.fromTime_utc = Math.max(userRecord.startTime, sickRecord.properties.fromTime_utc);
            sickRecord.properties.toTime_utc = userRecord.endTime;
            sickPeopleIntersected.push(sickRecord);
          }
        });
      }
    });
  }

  return sickPeopleIntersected;
};

const checkMillisecondsDiff = (to: number, from: number) => {
  return to - from > config().intersectMilliseconds;
};

export const isTimeOverlapping = (userRecord: Location, sickRecord: Exposure) => {
  return checkMillisecondsDiff(
    Math.min(userRecord.endTime, sickRecord.properties.toTime_utc),
    Math.max(userRecord.startTime, sickRecord.properties.fromTime_utc)
  );
};

export const isSpaceOverlapping = ({ lat, long }: Location, { properties: { radius }, geometry: { coordinates } }: Exposure) => {
  const start = {
    latitude: lat,
    longitude: long,
  };

  const end = {
    latitude: coordinates[config().sickGeometryLatIndex],
    longitude: coordinates[config().sickGeometryLongIndex],
  };

  return haversine(start, end, { threshold: radius || config().meterRadius, unit: config().bufferUnits });
};

export const onSickPeopleNotify = async (sickPeopleIntersected: Exposure[]) => {
  try {
    const dbSick = new IntersectionSickDatabase();

    const exposuresToUpdate = [];

    for (const currSick of sickPeopleIntersected) {
      const queryResult = await dbSick.containsObjectID(
        currSick.properties.Key_Field,
      );

      if (!queryResult) {
        currSick.properties.fromTime = currSick.properties.fromTime_utc;
        currSick.properties.toTime = currSick.properties.toTime_utc;
        currSick.properties.OBJECTID = currSick.properties.Key_Field;

        exposuresToUpdate.push(currSick);
        await dbSick.addSickRecord(currSick);
      }
    }

    store().dispatch(setExposures(exposuresToUpdate));

    const { locale, notificationData } = await store().dispatch(initLocale());

    exposuresToUpdate.length > 0 && await registerLocalNotification(
      notificationData.sickMessage[locale].title,
      notificationData.sickMessage[locale].body,
      notificationData.sickMessage.duration,
      'ms',
    );
  } catch (error) {
    onError({ error });
  }
};
