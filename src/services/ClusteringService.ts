import AsyncStorage from '@react-native-community/async-storage';
import moment from 'moment';
import _ from 'lodash';
import AsyncLock from 'async-lock';
import Geohash from 'latlon-geohash';
import { UserClusteredLocationsDatabase, UserLocationsDatabase } from '../database/Database';
import { onError } from './ErrorService';
import config from '../config/config';
import { Cluster, DBLocation } from '../types';
import { CLUSTER_JITTER_LOCATION, CURRENT_CLUSTER_LOCATIONS_DATA, DID_CLUSTER_LOCATIONS } from '../constants/Constants';

// tslint:disable-next-line:no-var-requires
const haversine = require('haversine');

const lock = new AsyncLock();

export const clusterSample = async () => {
  const locationsDB = new UserLocationsDatabase();
  const clustersDB = new UserClusteredLocationsDatabase();

  // fetch last 2 points from locations DB (AKA "buffer").
  const buffer: DBLocation[] = await locationsDB.getBufferSamplesForClustering(2);

  if (buffer.length < 2) {
    return;
  }

  // fetch current cluster from clusters DB.
  const currentCluster: Cluster = await clustersDB.getLastClusterEntered();

  const [firstLocationInBuffer, secondLocationInBuffer] = buffer;

  // if first point in buffer belongs to the current cluster.
  if (currentCluster) {
    if (areLocationsCreatingCluster(currentCluster, firstLocationInBuffer)) {
      const jitterLocation = JSON.parse(await AsyncStorage.getItem(CLUSTER_JITTER_LOCATION) || 'false');

      if (currentCluster.endTime === firstLocationInBuffer.startTime || jitterLocation) {
        const updatedCluster = await updateCluster(currentCluster, firstLocationInBuffer);
        await clustersDB.updateLastCluster(updatedCluster);
        await AsyncStorage.removeItem(CLUSTER_JITTER_LOCATION);
        return;
      }
    }

    if (
      moment(firstLocationInBuffer.endTime).diff(moment(firstLocationInBuffer.startTime), config().jitterUnits, true) < config().jitterValue
      && !areLocationsCreatingCluster(currentCluster, firstLocationInBuffer)
      && areLocationsCreatingCluster(currentCluster, secondLocationInBuffer)
      && currentCluster.endTime === firstLocationInBuffer.startTime
      && firstLocationInBuffer.endTime === secondLocationInBuffer.startTime
    ) {
      await AsyncStorage.setItem(CLUSTER_JITTER_LOCATION, 'true');
      return;
    }
  }

  await createCluster(clustersDB, firstLocationInBuffer);
};

const areLocationsCreatingCluster = (clusterOrLocation: Cluster|DBLocation, location: DBLocation) => {
  const start = {
    latitude: clusterOrLocation.lat,
    longitude: clusterOrLocation.long,
  };

  const end = {
    latitude: location.lat,
    longitude: location.long,
  };

  return haversine(start, end, { threshold: config().clusterRadius, unit: config().bufferUnits });
};

const updateCluster = async (cluster: Cluster, location: DBLocation) => {
  const updatedLat = ((cluster.lat * cluster.size) + location.lat) / (cluster.size + 1);
  const updatedLong = ((cluster.long * cluster.size) + location.long) / (cluster.size + 1);

  const clusterLocationsData: Array<{ lat: number, long: number }> = JSON.parse(await AsyncStorage.getItem(CURRENT_CLUSTER_LOCATIONS_DATA) || '[]');
  const clusterLocationsDataWithNewLocation = [...clusterLocationsData, { lat: location.lat, long: location.long }];

  const start = {
    latitude: updatedLat,
    longitude: updatedLong
  };

  const clusterRadii: number[] = clusterLocationsDataWithNewLocation.map(({ lat, long }) => haversine(start, { latitude: lat, longitude: long }, { unit: config().bufferUnits }));

  const updatedRadius = _.max(clusterRadii) || 0;

  // add new location to current cluster locations data.
  await AsyncStorage.setItem(CURRENT_CLUSTER_LOCATIONS_DATA, JSON.stringify(clusterLocationsDataWithNewLocation));

  return {
    lat: updatedLat,
    long: updatedLong,
    startTime: cluster.startTime,
    endTime: location.endTime,
    geoHash: cluster.geoHash,
    radius: updatedRadius,
    size: cluster.size + 1
  };
};

const createCluster = async (clustersDB: any, location: DBLocation) => {
  const { lat, long, startTime, endTime }: DBLocation = location;

  await clustersDB.addCluster({ lat, long, startTime, endTime, geoHash: Geohash.encode(lat, long, 6), radius: 0, size: 1 });

  // override previous cluster locations data with new location.
  await AsyncStorage.setItem(CURRENT_CLUSTER_LOCATIONS_DATA, JSON.stringify([{ lat, long }]));
};

export const clusterLocationsOnAppUpdate = () => new Promise(async (resolve) => {
  await lock.acquire('clusterLocationsOnAppUpdate', async (done) => {
    try {
      const didClusterLocations = await AsyncStorage.getItem(DID_CLUSTER_LOCATIONS);

      if (didClusterLocations) {
        done();
        resolve();
        return;
      }

      const db = new UserLocationsDatabase();
      const cdb = new UserClusteredLocationsDatabase();

      const currentLocations = await db.listSamples();

      const clustersBulkData = clusterLocationHistorySynchronously(currentLocations);
      await cdb.insertBulkClusters(clustersBulkData);

      await AsyncStorage.setItem(DID_CLUSTER_LOCATIONS, 'true');
      done();
      resolve();
    } catch (error) {
      done();
      resolve();
      onError({ error });
    }
  });
});

const clusterLocationHistorySynchronously = (currentLocations: DBLocation[]) => {
  let isJitter = false;
  let currentClusterLocationsData: Array<{ lat: number, long: number }> = [];
  const clusters: Cluster[] = [];

  currentLocations.forEach((_, index) => {
    // fetch last 2 points from locations DB (AKA "buffer").
    const buffer: DBLocation[] = currentLocations.slice(index, index + 2);

    if (buffer.length < 2) {
      return;
    }

    // fetch current cluster from clusters DB.
    const currentCluster: Cluster = clusters[clusters.length - 1];

    const [firstLocationInBuffer, secondLocationInBuffer] = buffer;

    // if first point in buffer belongs to the current cluster.
    if (currentCluster) {
      if (areLocationsCreatingCluster(currentCluster, firstLocationInBuffer)) {
        const jitterLocation = isJitter;

        if (currentCluster.endTime === firstLocationInBuffer.startTime || jitterLocation) {
          const { updatedCluster, clusterLocationsDataWithNewLocation } = updateClusterSynchronously(currentCluster, firstLocationInBuffer, currentClusterLocationsData);

          currentClusterLocationsData = clusterLocationsDataWithNewLocation;
          clusters[clusters.length - 1] = updatedCluster;
          isJitter = false;
          return;
        }
      }

      if (
        moment(firstLocationInBuffer.endTime).diff(moment(firstLocationInBuffer.startTime), config().jitterUnits, true) < config().jitterValue
        && !areLocationsCreatingCluster(currentCluster, firstLocationInBuffer)
        && areLocationsCreatingCluster(currentCluster, secondLocationInBuffer)
        && currentCluster.endTime === firstLocationInBuffer.startTime
        && firstLocationInBuffer.endTime === secondLocationInBuffer.startTime
      ) {
        isJitter = true;
        return;
      }
    }

    const { lat, long, startTime, endTime }: DBLocation = firstLocationInBuffer;
    clusters.push({ lat, long, startTime, endTime, geoHash: Geohash.encode(lat, long, 6), radius: 0, size: 1 });

    currentClusterLocationsData = [{ lat, long }];
  });

  return clusters;
};

const updateClusterSynchronously = (cluster: Cluster, location: DBLocation, clusterLocationsData: Array<{ lat: number, long: number }>) => {
  const updatedLat = ((cluster.lat * cluster.size) + location.lat) / (cluster.size + 1);
  const updatedLong = ((cluster.long * cluster.size) + location.long) / (cluster.size + 1);

  const clusterLocationsDataWithNewLocation = [...clusterLocationsData, { lat: location.lat, long: location.long }];

  const start = {
    latitude: updatedLat,
    longitude: updatedLong
  };

  const clusterRadii: number[] = clusterLocationsDataWithNewLocation.map(({ lat, long }) => haversine(start, { latitude: lat, longitude: long }, { unit: config().bufferUnits }));
  const updatedRadius = _.max(clusterRadii) || 0;

  return {
    clusterLocationsDataWithNewLocation,
    updatedCluster: {
      lat: updatedLat,
      long: updatedLong,
      startTime: cluster.startTime,
      endTime: location.endTime,
      geoHash: cluster.geoHash,
      radius: updatedRadius,
      size: cluster.size + 1
    }
  };
};
