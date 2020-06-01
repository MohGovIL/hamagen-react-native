import BackgroundTimer from 'react-native-background-timer';
import AsyncStorage from '@react-native-community/async-storage';
import moment from 'moment';
import geoHash from 'latlon-geohash';
import { Alert } from 'react-native';
import { setExposures } from '../actions/ExposuresActions';
import { initLocale } from '../actions/LocaleActions';
import { UserLocationsDatabase, IntersectionSickDatabase, UserClusteredLocationsDatabase } from '../database/Database';
import { registerLocalNotification } from './PushService';
import { downloadAndVerifySigning } from './SigningService';
import { match } from './BLEService';
import { onError } from './ErrorService';
import config from '../config/config';
import store from '../store';
import { Cluster, Exposure, Location, SickJSON } from '../types';
import { LAST_FETCH_TS, DISMISSED_EXPOSURES, IS_IOS, } from '../constants/Constants';

// tslint:disable-next-line:no-var-requires
const haversine = require('haversine');

export const startForegroundTimer = async () => {
  // prevent excessive calls to checkSickPeople
  // if (lastFetch && moment().valueOf() - lastFetch > config().fetchMilliseconds) {
  //   await checkBLESickPeople(lastFetch);
  //   await checkGeoSickPeople(lastFetch);
  // }

  BackgroundTimer.runBackgroundTimer(backgroundTimerFn, config().fetchMilliseconds);

  await AsyncStorage.setItem(
    LAST_FETCH_TS,
    JSON.stringify(moment().valueOf()),
  );
};

const backgroundTimerFn = async () => {
  const res = JSON.parse(await AsyncStorage.getItem(SERVICE_TRACKER) || '[]');
  await AsyncStorage.setItem(SERVICE_TRACKER, JSON.stringify([...res, { source: 'checkSickPeople - foreground', timestamp: moment().valueOf() }]));

  // const lastFetch: number = JSON.parse((await AsyncStorage.getItem(LAST_FETCH_TS)) || '0');

  // await checkBLESickPeople(lastFetch);
  // await checkGeoSickPeople(lastFetch);

  await AsyncStorage.setItem(
    LAST_FETCH_TS,
    JSON.stringify(moment().valueOf()),
  );
};

export const queryDB = async (isClusters: boolean) => {
  const db = new UserLocationsDatabase();
  const cdb = new UserClusteredLocationsDatabase();

  const rows = isClusters ? await cdb.listClusters() : await db.listSamples();
  return rows;
};

export const checkGeoSickPeopleFromFile = async (isClusters: boolean = false) => {
  try {
    const myData = await queryDB(isClusters);
    const jsonFromFile = store().getState().exposures.points;
    const sickPeopleIntersected: any = getIntersectingSickRecords(myData, jsonFromFile.points, isClusters);
    const filteredArr: Exposure[] = [];
    if (sickPeopleIntersected.length > 0) {
      const sickDB = new IntersectionSickDatabase();
      for (const currSick of sickPeopleIntersected) {
        const queryResult = await sickDB.containsObjectID(currSick.properties.Key_Field);
        if (!queryResult) {
          filteredArr.push(currSick);
          await sickDB.addSickRecord(currSick);
        }
      }
      if (filteredArr.length > 0) {
        await onSickPeopleNotify(filteredArr);
      }
    }
  } catch (e) {
    console.log(e);
  }
};

export const checkBLESickPeopleFromFile = async (bleMatch) => {
  const sickDB = new IntersectionSickDatabase();
  const hasBLTS = await sickDB.containsBLE(bleMatch.startContactTimestamp);

  if (!hasBLTS) {
    await sickDB.addBLESickRecord(bleMatch.startContactTimestamp);

    await onSickPeopleNotify([{
      properties: {
        wasThere: true,
        BLETimestamp: bleMatch.startContactTimestamp
      }
    }]);
  } else {
    Alert.alert('exposure already exists');
  }
};

export const checkBLESickPeople = async (forceCheck: boolean = false) => {
  // IOS currently disables BLE
  if (IS_IOS) return;

  try {
    const lastFetch: number = JSON.parse((await AsyncStorage.getItem(LAST_FETCH_TS)) || '0');
    // check if interval is above the minimum delay
    if (!forceCheck && moment(lastFetch).add(config().minimumBLEFetchIntervalMin, 'm').isAfter(moment())) {
      return;
    }
    
    const bleMatches: any[] = await match();
    
    if (bleMatches.length > 0) {
      const bleMatchNotUTC = bleMatches.sort((matchA, matchB) => matchB - matchA)[0];

      // convert ble match to have normal time(it lacks the ms's)
      const bleMatch = {
        ...bleMatchNotUTC,
        startContactTimestamp: parseInt(bleMatchNotUTC.startContactTimestamp.toString()) * 1000,
        endContactTimestamp: parseInt(bleMatchNotUTC.endContactTimestamp.toString()) * 1000
      };

      const sickDB = new IntersectionSickDatabase();

      // check if BLe match is not a duplicate
      const hasBLTS = await sickDB.containsBLE(bleMatch.startContactTimestamp);

      if (!hasBLTS) {
        await checkBleAndGeoIntersection(bleMatch, sickDB);
      }
    }
  } catch (error) {
    onError({ error });
  }
};


const checkBleAndGeoIntersection = async ({ startContactTimestamp, endContactTimestamp }, sickDB) => {
  const exposures: Exposure[] = await sickDB.listAllRecords();

  const overlappingGeoExposure = exposures.find(({properties}) => {
    properties?.OBJECTID && (Math.min(properties.toTime, endContactTimestamp) - Math.max(properties.fromTime, startContactTimestamp)
    ) > 0;
  });

  if (overlappingGeoExposure) {
    const newExposure = await sickDB.MergeBLEIntoSickRecord(overlappingGeoExposure.OBJECTID, startContactTimestamp);

    // if user already told us he was not there - alert him by removing exposure from dismissed and resetting it in exposures
    if (!overlappingGeoExposure.wasThere) {
      const dismissedExposures = await AsyncStorage.getItem(DISMISSED_EXPOSURES);
      const parsedDismissedExposures: number[] = JSON.parse(dismissedExposures ?? '');
      await AsyncStorage.setItem(DISMISSED_EXPOSURES, JSON.stringify(parsedDismissedExposures.filter((num: number) => num !== overlappingGeoExposure.OBJECTID)));
      store().dispatch(setExposures([newExposure]));
    }
  } else {
    // new exposure that doesn't overlap
    await sickDB.addBLESickRecord(startContactTimestamp);

    await onSickPeopleNotify([{
      properties: {
        wasThere: true,
        BLETimestamp: startContactTimestamp
      }
    }]);
  }
};

export const checkGeoSickPeople = async (forceCheck: boolean = false,isClusters: boolean) => {
  try {
    const lastFetch: number = JSON.parse((await AsyncStorage.getItem(LAST_FETCH_TS)) || '0');
    // check if interval is above the minimum delay
    if (!forceCheck && moment(lastFetch).add(config().minimumGeoFetchIntervalMin, 'm').isAfter(moment())) {
      return;
    }
    
    const responseJson: SickJSON = await downloadAndVerifySigning(config().dataUrl_utc);
    const myData = await queryDB(isClusters);
    
    const shouldFilterByGeohash = !!responseJson.features[0]?.properties?.geohashFilter;
    const sickPeopleIntersected: any = shouldFilterByGeohash ? getIntersectingSickRecordsByGeoHash(myData, responseJson, isClusters) : getIntersectingSickRecords(myData, responseJson, isClusters);

    if (sickPeopleIntersected.length > 0) {
      const dbSick = new IntersectionSickDatabase();

      const filteredIntersected: Exposure[] = [];
      for (const currSick of sickPeopleIntersected) {
        const queryResult = await dbSick.containsObjectID(
          currSick.properties.Key_Field,
        );
        // exposure is not a duplicate
        if (!queryResult) {
          const overlappingBLEExposure = await checkGeoAndBleIntersection(currSick, dbSick);
          // BLE was found
          if (overlappingBLEExposure?.BLETimestamp) {
            // merge geo and ble exposure
            await dbSick.MergeGeoIntoSickRecord(currSick, overlappingBLEExposure.BLETimestamp);
          } else {
            filteredIntersected.push(currSick);
            await dbSick.addSickRecord(currSick);
          }
        }
      }

      if (filteredIntersected.length > 0) {
        await onSickPeopleNotify(filteredIntersected);
      }
    }
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
  // remove duplicates
  return [...new Set(sickPeopleIntersected)];
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
  const sickPeopleIntersectedSet = new Set(sickPeopleIntersected);
  // sort array from the most early to last
  return [...sickPeopleIntersectedSet].sort((intersectA, intersectB) => intersectA.fromTime_utc - intersectB.fromTime_utc).reverse();
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

export const isSpaceOverlapping = (clusterOrLocation: Location | Cluster, { properties: { radius }, geometry: { coordinates } }: Exposure, isClusters: boolean) => {
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

const checkGeoAndBleIntersection = async (currSick, dbSick) => {
  const exposures: Exposure[] = await dbSick.listAllRecords();
  return exposures.find((exposure) => {
    // if its a geo exposure or exposure doesn't have ble time stamp
    if (exposure.OBJECTID !== null || !exposure.BLETimestamp) return false;

    const bleStart = moment.utc(exposure.BLETimestamp).startOf('hour').valueOf();
    const bleEnd = moment.utc(exposure.BLETimestamp).startOf('hour').add(1, 'hours').valueOf();

    return (Math.min(currSick.properties.toTime_utc, bleEnd) - Math.max(currSick.properties.fromTime_utc, bleStart)) > 0;
  });
};

export const onSickPeopleNotify = async (sickPeopleIntersected: Exposure[]) => {
  try {
    if (sickPeopleIntersected.length > 0) {
      store().dispatch(setExposures(sickPeopleIntersected));

      const { locale, notificationData } = await store().dispatch(initLocale());

      await registerLocalNotification(
        notificationData.sickMessage[locale].title,
        notificationData.sickMessage[locale].body,
        notificationData.sickMessage.duration,
        'ms',
      );
    }
  } catch (error) {
    onError({ error });
  }
};
