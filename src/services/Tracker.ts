import { NativeModules } from 'react-native';
import BackgroundTimer from 'react-native-background-timer';
import AsyncStorage from '@react-native-community/async-storage';
import moment from 'moment';
import {
  UserLocationsDatabase,
  IntersectionSickDatabase,
} from '../database/Database';
import { Exposure, Location, SickJSON } from '../types';
import { registerLocalNotification } from './PushService';
import { setExposures } from '../actions/ExposuresActions';
import config from '../config/config';
import store from '../store';
import { onError } from './ErrorService';
import { IS_IOS, LAST_FETCH_TS } from '../constants/Constants';

const haversine = require('haversine');

export const startForegroundTimer = async () => {
  await checkSickPeople();

  BackgroundTimer.runBackgroundTimer(async () => {
    await checkSickPeople();
  }, config().sampleInterval);
};

export const queryDB = async () => {
  const db = new UserLocationsDatabase();
  const rows = await db.listSamples();
  return rows;
};

export const checkSickPeople = async () => {
  const lastFetch = JSON.parse(
    (await AsyncStorage.getItem(LAST_FETCH_TS)) || '0',
  );

  // prevent excessive calls to checkSickPeople
  if (lastFetch && moment().valueOf() - lastFetch < config().fetchMilliseconds) {
    return;
  }

  fetch(`${config().dataUrl_utc}?r=${Math.random()}`, { headers: { 'Content-Type': 'application/json;charset=utf-8' } })
    .then(response => response.json())
    .then(async (responseJson) => {
      const myData = await queryDB();

      const sickPeopleIntersected: any = getIntersectingSickRecords(
        myData,
        responseJson,
      );

      if (sickPeopleIntersected.length > 0) {
        await onSickPeopleNotify(sickPeopleIntersected);
      }

      await AsyncStorage.setItem(
        LAST_FETCH_TS,
        JSON.stringify(moment().valueOf()),
      );
    })
    .catch((error) => {
      onError(error);
    });
};

export const getIntersectingSickRecords = (
  myData: Location[],
  sickRecordsJson: SickJSON,
) => {
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
          sickRecord.properties.fromTime_utc = userRecord.startTime;
          sickRecord.properties.toTime_utc = userRecord.endTime;
          sickPeopleIntersected.push(sickRecord);
        }
      });
    });
  }

  return sickPeopleIntersected;
};

const checkMillisecondsDiff = (to: number, from: number) => {
  return to - from > config().intersectMilliseconds;
};

export const isTimeOverlapping = (userRecord: Location, sickRecord: Exposure) => {
  // End time in the range
  return (
    (userRecord.endTime > sickRecord.properties.fromTime_utc
      && userRecord.endTime < sickRecord.properties.toTime_utc
      && checkMillisecondsDiff(
        userRecord.endTime,
        Math.max(sickRecord.properties.fromTime_utc, userRecord.startTime),
      ))
    // in the range
    || (userRecord.startTime < sickRecord.properties.fromTime_utc
      && userRecord.endTime > sickRecord.properties.toTime_utc
      && checkMillisecondsDiff(
        sickRecord.properties.toTime_utc,
        sickRecord.properties.fromTime_utc,
      ))
    // Start time in the range
    || (userRecord.startTime > sickRecord.properties.fromTime_utc
      && userRecord.startTime < sickRecord.properties.toTime_utc
      && checkMillisecondsDiff(
        Math.min(sickRecord.properties.toTime_utc, userRecord.endTime),
        userRecord.startTime,
      ))
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

  let locale: 'he' | 'en' | 'ar' | 'am' | 'ru' | 'fr' = (IS_IOS
    ? NativeModules.SettingsManager.settings.AppleLocale
    : NativeModules.I18nManager.localeIdentifier
  ).substr(0, 2);

  if (!['he', 'en', 'ar', 'am', 'ru', 'fr'].includes(locale)) {
    locale = 'he';
  }

  exposuresToUpdate.length > 0
    && (await registerLocalNotification(
      config().sickMessage[locale].title,
      config().sickMessage[locale].body,
      config().sickMessage.duration,
      'ms',
    ));
};
