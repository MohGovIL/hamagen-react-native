import { NativeModules } from 'react-native';
import BackgroundTimer from 'react-native-background-timer';
import AsyncStorage from '@react-native-community/async-storage';
import moment from 'moment';
import { UserLocationsDatabase, IntersectionSickDatabase } from '../database/Database';
import config from '../config/config';
import { Exposure } from '../types';
import { registerLocalNotification } from './PushService';
import { setExposures } from '../actions/ExposuresActions';
import store from '../store';
import { IS_IOS, LAST_FETCH_TS } from '../constants/Constants';
import { onError } from './ErrorService';

const haversine = require('haversine');

const _URL = config.dataUrl;
const METER_RADIUS = config.meterRadius; // 500 meters
const INTERSECT_MILLISECONDS = config.intersectMilliseconds;
const BUFFER_UNIT = config.bufferUnits;

export const startForegroundTimer = async () => {
  await checkSickPeople();

  BackgroundTimer.runBackgroundTimer(async () => {
    await checkSickPeople();
  },
  config.sampleInterval);
};

const checkMillisecondsDiff = (to: number, from: number) => {
  return ((to - from) > INTERSECT_MILLISECONDS);
};

export const isTimeOverlapping = (userRecord: any, sickRecord: any) => {
  // End time in the range
  return (userRecord.endTime > sickRecord.properties.fromTime && userRecord.endTime < sickRecord.properties.toTime && (checkMillisecondsDiff(userRecord.endTime, Math.max(sickRecord.properties.fromTime, userRecord.startTime))))
    // in the range
    || (userRecord.startTime < sickRecord.properties.fromTime && userRecord.endTime > sickRecord.properties.toTime && (checkMillisecondsDiff(sickRecord.properties.toTime, sickRecord.properties.fromTime)))
    // Start time in the range
    || (userRecord.startTime > sickRecord.properties.fromTime && userRecord.startTime < sickRecord.properties.toTime && (checkMillisecondsDiff(Math.min(sickRecord.properties.toTime, userRecord.endTime), userRecord.startTime)));
};

export const isSpaceOverlapping = (userRecord: any, sickRecord: any) => {

  const start = {
    latitude: userRecord.lat,
    longitude: userRecord.long
  };

  const end = {
    latitude: sickRecord.properties.POINT_Y,
    longitude: sickRecord.properties.POINT_X
  };

  return haversine(start, end, { threshold: METER_RADIUS, unit: BUFFER_UNIT });
};

export const getIntersectingSickRecords = (myData: any, sickRecordsJson: any) => {
  const sickPeopleIntersected: any = [];

  if (myData.length === 0) {
    console.log('Could not find data');
  } else {
    // for each feature in json data
    sickRecordsJson.features.map((sickRecord: any) => {
      // for each raw in user data
      myData.forEach((userRecord: any) => {
        if (isTimeOverlapping(userRecord, sickRecord) && isSpaceOverlapping(userRecord, sickRecord)) {
          // add sick people you intersects
          sickPeopleIntersected.push(sickRecord);
        }
      });
    });
  }

  return sickPeopleIntersected;
};

export const checkSickPeople = async () => {
  const lastFetch = JSON.parse(await AsyncStorage.getItem(LAST_FETCH_TS) || '0');

  // prevent excessive calls to checkSickPeople
  if (lastFetch && ((moment().valueOf() - lastFetch) < config.fetchMilliseconds)) {
    return;
  }

  fetch(_URL, { headers: { 'Content-Type': 'application/json;charset=utf-8' } })
    .then(response => response.json())
    .then(async (responseJson) => {
      const myData = await queryDB();

      const sickPeopleIntersected: any = getIntersectingSickRecords(myData, responseJson);

      if (sickPeopleIntersected.length > 0) {
        await onSickPeopleNotify(sickPeopleIntersected);
      }

      await AsyncStorage.setItem(LAST_FETCH_TS, JSON.stringify(moment().valueOf()));
    })
    .catch((error) => {
      onError(error);
    });
};

export const queryDB = async () => {
  const db = new UserLocationsDatabase();
  const rows = await db.listSamples();
  return rows;
};

export const onSickPeopleNotify = async (sickPeopleIntersected: Exposure[]) => {
  const dbSick = new IntersectionSickDatabase();

  const exposuresToUpdate = [];

  for (const currSick of sickPeopleIntersected) {
    const queryResult = await dbSick.containsObjectID(currSick.properties.OBJECTID);

    if (!queryResult) {
      exposuresToUpdate.push(currSick);
      await dbSick.addSickRecord(currSick);
    }
  }

  store().dispatch(setExposures(exposuresToUpdate));

  let locale: 'he' | 'en' | 'ar' | 'am' | 'ru' = (IS_IOS ? NativeModules.SettingsManager.settings.AppleLocale : NativeModules.I18nManager.localeIdentifier).substr(0, 2);

  if (!['he', 'en', 'ar', 'am', 'ru'].includes(locale)) {
    locale = 'he';
  }

  exposuresToUpdate.length > 0 && await registerLocalNotification(config.sickMessage[locale].title, config.sickMessage[locale].body, config.sickMessage.duration, 'ms');
};
