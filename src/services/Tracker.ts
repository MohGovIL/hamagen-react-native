import BackgroundTimer from 'react-native-background-timer';
import AsyncStorage from '@react-native-community/async-storage';
import moment from 'moment';
import geoHash from 'latlon-geohash';
import { setExposures, updateGeoPastExposure, updateBlePastExposure, removeGeoPastExposure } from '../actions/ExposuresActions';
import { initLocale } from '../actions/LocaleActions';
import { UserLocationsDatabase, IntersectionSickDatabase, UserClusteredLocationsDatabase } from '../database/Database';
import { registerLocalNotification } from './PushService';
import { downloadAndVerifySigning } from './SigningService';
import { match, initBLETracing } from './BLEService';
import { onError } from './ErrorService';
import config from '../config/config';
import store from '../store';
import { Cluster, Exposure, Location, SickJSON, ExposureProperties } from '../types';
import { LAST_FETCH_TS, DISMISSED_EXPOSURES, IS_IOS } from '../constants/Constants';

// tslint:disable-next-line:no-var-requires
const haversine = require('haversine');

export const startForegroundTimer = async () => {
  await checkBLESickPeople();
  await checkGeoSickPeople();

  BackgroundTimer.runBackgroundTimer(backgroundTimerFn, config().fetchMilliseconds);
  if (IS_IOS) {
    // background timer to try and restarting BLE service in IOS
    BackgroundTimer.runBackgroundTimer(initBLETracing, config().fetchMilliseconds);
  }

  await AsyncStorage.setItem(
    LAST_FETCH_TS,
    JSON.stringify(moment().valueOf()),
  );
};

const backgroundTimerFn = async () => {
  await checkBLESickPeople();
  await checkGeoSickPeople();

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

export const checkBLESickPeople = async () => {
  try {
    const lastFetch: number = JSON.parse((await AsyncStorage.getItem(LAST_FETCH_TS)) || '0');
    // check if interval is above the minimum delay
    if (moment(lastFetch).add(config().minimumBLEFetchIntervalMin, 'm').isAfter(moment())) {
      return;
    }

    const bleMatches: any[] = await match();

    if (bleMatches.length > 0) {
      const bleMatchNotUTC = bleMatches.sort((matchA, matchB) => matchB.startContactTimestamp - matchA.startContactTimestamp)[0];

      // convert ble match to have normal time(it lacks the ms's)
      const bleMatch = {
        ...bleMatchNotUTC,
        startContactTimestamp: parseInt(bleMatchNotUTC.startContactTimestamp.toString()) * 1000,
        endContactTimestamp: parseInt(bleMatchNotUTC.endContactTimestamp.toString()) * 1000
      };

      bleMatch.BLETimestamp = moment(Math.floor((bleMatch.startContactTimestamp + bleMatch.endContactTimestamp) / 2)).startOf('hour').valueOf();

      const sickDB = new IntersectionSickDatabase();

      // check if BLe match is not a duplicate
      const hasBLTS = await sickDB.containsBLE(bleMatch.BLETimestamp);

      if (!hasBLTS) {
        await checkBleAndGeoIntersection(bleMatch, sickDB);
      }
    }
  } catch (error) {
    onError({ error });
  }
};


const checkBleAndGeoIntersection = async ({ startContactTimestamp, endContactTimestamp, BLETimestamp }, sickDB) => {
  const exposures: Exposure[] = await sickDB.listAllRecords();

  const overlappingGeoExposure = exposures.find((properties) => {
    return properties?.OBJECTID && (Math.min(properties.toTime, endContactTimestamp) - Math.max(properties.fromTime, startContactTimestamp)) > 0;
  });

  if (overlappingGeoExposure) {
    const newExposure = await sickDB.MergeBLEIntoSickRecord(overlappingGeoExposure.OBJECTID, BLETimestamp);

    // if user already told us he was not there - alert him by removing exposure from dismissed and resetting it in exposures
    if (!overlappingGeoExposure.wasThere) {
      // remove exposure from dismissed exposures list
      const dismissedExposures = await AsyncStorage.getItem(DISMISSED_EXPOSURES);
      const parsedDismissedExposures: number[] = JSON.parse(dismissedExposures ?? '');
      await AsyncStorage.setItem(DISMISSED_EXPOSURES, JSON.stringify(parsedDismissedExposures.filter((num: number) => num !== overlappingGeoExposure.OBJECTID)));
      
      store().dispatch(removeGeoPastExposure(overlappingGeoExposure.OBJECTID));

      await onSickPeopleNotify([{
        ...overlappingGeoExposure,
        wasThere: true,
        BLETimestamp
      }]);
    }

    // update in past exposures
    store().dispatch(updateGeoPastExposure({
      properties: {
        ...overlappingGeoExposure,
        wasThere: true,
        BLETimestamp
      }
    }));
  } else {
    const lastExposure = exposures.filter(properties => properties.BLETimestamp).sort((matchA, matchB) => matchB.BLETimestamp - matchA.BLETimestamp)[0];
    // check if latest ble exposure is before the new exposure
    if (!lastExposure?.BLETimestamp || moment(BLETimestamp).isAfter(lastExposure.BLETimestamp)) {
      // new exposure that doesn't overlap
      const sick = await sickDB.addBLESickRecord(BLETimestamp);

      await onSickPeopleNotify([sick]);
    }
  }
};


export const checkGeoSickPeople = async () => {
  try {
    const lastFetch: number = JSON.parse((await AsyncStorage.getItem(LAST_FETCH_TS)) || '0');
    // check if interval is above the minimum delay
    if (moment(lastFetch).add(config().minimumGeoFetchIntervalMin, 'm').isAfter(moment())) {
      return;
    }

    const responseJson: SickJSON = await downloadAndVerifySigning(config().dataUrl_utc);
    const myData = await queryDB(config().intersectWithClusters);

    const shouldFilterByGeohash = !!responseJson.features[0]?.properties?.geohashFilter;
    const sickPeopleIntersected: any = shouldFilterByGeohash ? getIntersectingSickRecordsByGeoHash(myData, responseJson) : getIntersectingSickRecords(myData, responseJson);

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
            // update merged exposure in store
            store().dispatch(updateBlePastExposure({
              properties: {
                ...currSick.properties,
                BLETimestamp: overlappingBLEExposure.BLETimestamp,
                wasThere: true
              }
            }));
          } else {
            const sick = await dbSick.addSickRecord(currSick);
            filteredIntersected.push(sick);
          }
        }
      }

      if (filteredIntersected.length > 0) {
        await onSickPeopleNotify(filteredIntersected);
      }
    }
  } catch (error) {
    onError({ error });
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

  return [...new Set(sickPeopleIntersected)];
};

export const getIntersectingSickRecordsByGeoHash = (myData: Location[], sickRecordsJson: SickJSON) => {
  const sickPeopleIntersected: any[] = [];

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
      if (mappedLocations[geo]) {
        mappedLocations[geo].forEach((userRecord: Location) => {
          if (isTimeOverlapping(userRecord, sickRecord) && isSpaceOverlapping(userRecord, sickRecord)) {
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
  return [...sickPeopleIntersectedSet].sort((intersectA, intersectB) => intersectB.fromTime_utc - intersectA.fromTime_utc);
};


const checkMillisecondsDiff = (to: number, from: number) => {
  return to - from > (config().intersectWithClusters ? config().intersectMillisecondsWithCluster : config().intersectMilliseconds);
};

export const isTimeOverlapping = (userRecord: Location, sickRecord: Exposure) => {
  return checkMillisecondsDiff(
    Math.min(userRecord.endTime, sickRecord.properties.toTime_utc),
    Math.max(userRecord.startTime, sickRecord.properties.fromTime_utc)
  );
};

export const isSpaceOverlapping = (clusterOrLocation: Location | Cluster, { properties: { radius }, geometry: { coordinates } }: Exposure) => {
  const start = {
    latitude: clusterOrLocation.lat,
    longitude: clusterOrLocation.long,
  };

  const end = {
    latitude: coordinates[config().sickGeometryLatIndex],
    longitude: coordinates[config().sickGeometryLongIndex],
  };

  return haversine(start, end, { threshold: (radius || config().meterRadius) + (config().intersectWithClusters ? clusterOrLocation.radius : 0), unit: config().bufferUnits });
};

const checkGeoAndBleIntersection = async (currSick, dbSick) => {
  const exposures: ExposureProperties[] = await dbSick.listAllRecords();
  return exposures.find((exposure) => {
    // if its a geo exposure or exposure doesn't have ble time stamp
    if (exposure.OBJECTID !== null || !exposure.BLETimestamp) return false;

    const bleStart = moment(exposure.BLETimestamp).valueOf();
    const bleEnd = moment(exposure.BLETimestamp).add(1, 'hours').valueOf();
    
    return (Math.min(currSick.properties.toTime_utc, bleEnd) - Math.max(currSick.properties.fromTime_utc, bleStart)) > 0;
  });
};

export const onSickPeopleNotify = async (sickPeopleIntersected: ExposureProperties[]) => {
  try {
    if (sickPeopleIntersected.length > 0) {
      await store().dispatch(setExposures(sickPeopleIntersected.map((exposure: any) => ({ properties: { ...exposure } }))));

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
