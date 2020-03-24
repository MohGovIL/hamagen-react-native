import geoHash from 'latlon-geohash';
import AsyncStorage from '@react-native-community/async-storage';
import AsyncLock from 'async-lock';
import { startLocationTracking } from './LocationService';
import { UserLocationsDatabase, WifiMacAddressDatabase } from '../database/Database';
import { sha256 } from './sha256.js';
import { getWifiList } from './WifiService';
import { onError } from './ErrorService';
import { FIRST_POINT_TS, LAST_POINT_START_TIME } from '../constants/Constants';
import store from '../store';
import { UPDATE_FIRST_POINT } from '../constants/ActionTypes';

const lock = new AsyncLock();

export const startSampling = async () => {
  await startLocationTracking();
};

export const insertHistoricDB = async function(samples:any[]){
  const db = new UserLocationsDatabase();
  const finalSamples = samples.map((sample:any) => ({
    lat: sample.coords.latitude,
    long: sample.coords.longitude,
    accuracy: sample.coords.accuracy,
    startTime: sample.timestamp,
    endTime: sample.timestamp,
    geoHash: geoHash.encode(sample.coords.latitude, sample.coords.longitude),
  })).map( s =>({
    ...s,
    hash: sha256(JSON.stringify(s))
  }))
  await db.addSamples(finalSamples); 
};

export const insertDB = async (sample: any) => new Promise(async (resolve) => {
  // prevent race condition of entering multiple points at the same time
  await lock.acquire('insertDB', async (done) => {
    try {
      // save first point timestamp (if needed), displayed in the main screen.
      const firstPointTS = await hasFirstPointTimestamp();

      if (!firstPointTS) {
        store().dispatch({ type: UPDATE_FIRST_POINT, payload: sample.timestamp });
        await saveToStorage(FIRST_POINT_TS, sample.timestamp);
      }

      // check last point timestamp and ignore if same point entered again.
      const lastPointStartTime = hasLastPointTimestamp();

      if (lastPointStartTime && (lastPointStartTime === sample.timestamp)) {
        resolve();
        done();
        return true;
      }

      await saveToStorage(LAST_POINT_START_TIME, sample.timestamp);

      const { wifiHash, wifiList }: any = await getWifiList();
      const db = new UserLocationsDatabase();

      const wifiMacAddressDatabase = new WifiMacAddressDatabase();

      sample.timestamp += 2 * 60 * 60 * 1000;

      db.updateLastSampleEndTime(sample.timestamp).then(async () => {
        const sampleObj = {
          lat: sample.coords.latitude,
          long: sample.coords.longitude,
          accuracy: sample.coords.accuracy,
          startTime: sample.timestamp,
          endTime: sample.timestamp,
          geoHash: geoHash.encode(sample.coords.latitude, sample.coords.longitude),
          wifiHash
        };

        const finalSample = { ...sampleObj, hash: sha256(JSON.stringify(sampleObj)) };

        await db.addSample(finalSample);

        const isExist = await wifiMacAddressDatabase.containsWifiHash(wifiHash);

        if (!isExist) {
          await wifiMacAddressDatabase.addWifiMacAddresses({ wifiHash, wifiList });
        }

        resolve();
        done();
        return true;
      });
    } catch (error) {
      resolve();
      onError({ error });
    }
  });
});

const hasFirstPointTimestamp = () => new Promise(async (resolve) => {
  try {
    resolve(JSON.parse(await AsyncStorage.getItem(FIRST_POINT_TS) || 'false'));
  } catch (error) {
    resolve(false);
    onError({ error });
  }
});

const hasLastPointTimestamp = () => new Promise(async (resolve) => {
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
