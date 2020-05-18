import BackgroundTimer from 'react-native-background-timer';
import AsyncStorage from '@react-native-community/async-storage';
import moment from 'moment';
import geoHash from 'latlon-geohash';
import { setExposures } from '../actions/ExposuresActions';
import { initLocale } from '../actions/LocaleActions';
import { UserLocationsDatabase, IntersectionSickDatabase, UserClusteredLocationsDatabase } from '../database/Database';
import { registerLocalNotification } from './PushService';
import { downloadAndVerifySigning } from './SigningService';
import { onError } from './ErrorService';
import config from '../config/config';
import store from '../store';
import { Cluster, Exposure, Location, SickJSON } from '../types';
import { SERVICE_TRACKER, LAST_FETCH_TS } from '../constants/Constants';

// tslint:disable-next-line:no-var-requires
const haversine = require('haversine');

export const startForegroundTimer = async () => {
  // await checkSickPeople();

  BackgroundTimer.runBackgroundTimer(async () => {
    const res = JSON.parse(await AsyncStorage.getItem(SERVICE_TRACKER) || '[]');
    await AsyncStorage.setItem(SERVICE_TRACKER, JSON.stringify([...res, { source: 'checkSickPeople - foreground', timestamp: moment().valueOf() }]));

    // await checkSickPeople();
  }, config().fetchMilliseconds);
};

export const queryDB = async (isClusters: boolean) => {
  const db = new UserLocationsDatabase();
  const cdb = new UserClusteredLocationsDatabase();

  const rows = isClusters ? await cdb.listClusters() : await db.listSamples();
  return rows;
};

export const checkSickPeopleFromFile = async (isClusters: boolean = false) => {
  try {
    const myData = await queryDB(isClusters);
    const jsonFromFile = store().getState().exposures.points;

    const sickPeopleIntersected: any = getIntersectingSickRecords(myData, jsonFromFile.points, isClusters);
    if (sickPeopleIntersected.length > 0) {
      onSickPeopleNotify(sickPeopleIntersected);
    }
  } catch (e) {
    console.log(e);
  }
};

export const checkSickPeople = async (forceCheck: boolean = false, isClusters: boolean) => {
  try {
    const lastFetch = JSON.parse((await AsyncStorage.getItem(LAST_FETCH_TS)) || '0');

    // prevent excessive calls to checkSickPeople
    if (!forceCheck && lastFetch && moment().valueOf() - lastFetch < config().fetchMilliseconds) {
      return;
    }

    const responseJson: SickJSON = await downloadAndVerifySigning(config().dataUrl_utc);
    const myData = await queryDB(isClusters);

    const shouldFilterByGeohash = !!responseJson.features[0]?.properties?.geohashFilter;
    const sickPeopleIntersected: any = shouldFilterByGeohash ? getIntersectingSickRecordsByGeoHash(myData, responseJson, isClusters) : getIntersectingSickRecords(myData, responseJson, isClusters);

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

export const getIntersectingSickRecords = (myData: Location[], sickRecordsJson: SickJSON, isClusters: boolean) => {
  const sickPeopleIntersected: any = [];

  if (myData.length === 0) {
    console.log('Could not find data');
  } else {
    // for each feature in json data
    sickRecordsJson.features.map((sickRecord: Exposure) => {
      // for each raw in user data
      myData.reverse().forEach((userRecord: Location) => {
        if (
          isTimeOverlapping(userRecord, sickRecord, isClusters)
          && isSpaceOverlapping(userRecord, sickRecord, isClusters)
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

export const getIntersectingSickRecordsByGeoHash = (myData: Location[], sickRecordsJson: SickJSON, isClusters: boolean) => {
  const sickPeopleIntersected: any = [];

  if (myData.length === 0) {
    console.log('Could not find data');
    return sickPeopleIntersected;
  }

  const mappedLocations: { [key: string]: Location[] } = {};

  myData.forEach((location) => {
    // fix for geoHashes entered with a "'" from google timeline.
    const locationGeohashPrefix = location.geoHash.replace(/[']/g, '').slice(0, sickRecordsJson.features[0].properties.geohashFilter.length);

    if (mappedLocations[locationGeohashPrefix]) {
      mappedLocations[locationGeohashPrefix].push(location);
    } else {
      mappedLocations[locationGeohashPrefix] = [location];
    }
  });

  // for each feature in json data
  sickRecordsJson.features.forEach((sickRecord: Exposure) => {
    const sickRecordGeohashPrefix = sickRecord.properties.geohashFilter;
    // get 8 neighbors of geolocation
    const neighborsArr = [sickRecordGeohashPrefix, ...Object.values(geoHash.neighbours(sickRecordGeohashPrefix))];
    neighborsArr.forEach((geo) => {
      // for each raw in user data
      if (mappedLocations[sickRecordGeohashPrefix]) {
        mappedLocations[sickRecordGeohashPrefix].reverse().forEach((userRecord: Location) => {
          if (isTimeOverlapping(userRecord, sickRecord, isClusters) && isSpaceOverlapping(userRecord, sickRecord, isClusters)) {
            // add sick people you intersects
            sickRecord.properties.fromTime_utc = Math.max(userRecord.startTime, sickRecord.properties.fromTime_utc);
            sickRecord.properties.toTime_utc = userRecord.endTime;
            sickPeopleIntersected.push(sickRecord);
          }
        });
      }
    });
  });

  // sort array from the most early to last
  return sickPeopleIntersected.sort((intersectA, intersectB) => intersectA.fromTime_utc - intersectB.fromTime_utc).reverse();
};


const checkMillisecondsDiff = (to: number, from: number, isClusters: boolean) => {
  return to - from > (isClusters ? config().intersectMillisecondsWithCluster : config().intersectMilliseconds);
};

export const isTimeOverlapping = (userRecord: Location, sickRecord: Exposure, isClusters: boolean) => {
  return checkMillisecondsDiff(
    Math.min(userRecord.endTime, sickRecord.properties.toTime_utc),
    Math.max(userRecord.startTime, sickRecord.properties.fromTime_utc),
    isClusters
  );
};

export const isSpaceOverlapping = (clusterOrLocation: Location|Cluster, { properties: { radius }, geometry: { coordinates } }: Exposure, isClusters: boolean) => {
  const start = {
    latitude: clusterOrLocation.lat,
    longitude: clusterOrLocation.long,
  };

  const end = {
    latitude: coordinates[config().sickGeometryLatIndex],
    longitude: coordinates[config().sickGeometryLongIndex],
  };

  return haversine(start, end, { threshold: (radius || config().meterRadius) + (isClusters ? clusterOrLocation.radius : 0), unit: config().bufferUnits });
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
        currSick.properties.lat = currSick.geometry.coordinates[config().sickGeometryLatIndex];
        currSick.properties.long = currSick.geometry.coordinates[config().sickGeometryLongIndex];

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
