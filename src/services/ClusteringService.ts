import AsyncStorage from '@react-native-community/async-storage';
import moment from 'moment';
import _ from 'lodash';
import { Cluster, DBLocation } from '../types';
import { UserClusteredLocationsDatabase, UserLocationsDatabase } from '../database/Database';
import config from '../config/config';
import { CLUSTER_JITTER_LOCATION, CURRENT_CLUSTER_LOCATIONS_DATA } from '../constants/Constants';

// tslint:disable-next-line:no-var-requires
const haversine = require('haversine');

export const clusterSample = async () => {
  const locationsDB = new UserLocationsDatabase();
  const clustersDB = new UserClusteredLocationsDatabase();

  // fetch last 3 points from locations DB (AKA "buffer").
  const buffer: DBLocation[] = await locationsDB.getBufferSamplesForClustering(3);

  if (buffer.length < 3) {
    return;
  }

  // fetch current cluster from clusters DB.
  const currentCluster = await clustersDB.getLastClusterEntered();

  const [firstLocationInBuffer, secondLocationInBuffer, thirdLocationInBuffer] = buffer;

  // if no current cluster or first point is outside the cluster timeline
  if (!currentCluster || !await isLocationWithinClusterTimeline(currentCluster, firstLocationInBuffer)) {
    // create new cluster with first point from buffer.
    await createCluster(clustersDB, firstLocationInBuffer);
    return;
  }

  // if first point in buffer belongs to the current cluster.
  if (areLocationsCreatingCluster(currentCluster, firstLocationInBuffer)) {
    const jitterLocation = JSON.stringify(await AsyncStorage.getItem(CLUSTER_JITTER_LOCATION) || 'false');

    // add it to current cluster only if not jitter or cluster+first+second are sequential.
    if (!jitterLocation || (currentCluster.endTime === firstLocationInBuffer.startTime && firstLocationInBuffer.endTime === secondLocationInBuffer.startTime)) {
      const updatedCluster = updateCluster(currentCluster, firstLocationInBuffer);
      await clustersDB.updateLastCluster(updatedCluster);
      await AsyncStorage.removeItem(CLUSTER_JITTER_LOCATION);
      return;
    }
  }

  // if first point in buffer don't belong to the current cluster and it's duration is longer then X minutes
  const isNotBelongToClusterAndLongDuration = moment(firstLocationInBuffer.endTime).diff(moment(firstLocationInBuffer.startTime), config().jitterUnits, true) >= config().jitterValue;
  // else if first point duration is shorter then X minutes and it belongs to second point in buffer
  const isShortDurationAndBelongToSecondLocation = secondLocationInBuffer.startTime === firstLocationInBuffer.endTime && areLocationsCreatingCluster(firstLocationInBuffer, secondLocationInBuffer);

  if (isNotBelongToClusterAndLongDuration || isShortDurationAndBelongToSecondLocation) {
    // create new cluster with first point from buffer.
    await createCluster(clustersDB, firstLocationInBuffer);
  } else if ( // else if not belongs to second point in buffer and belongs to third point in buffer
    firstLocationInBuffer.endTime === secondLocationInBuffer.startTime
    && secondLocationInBuffer.endTime === thirdLocationInBuffer.startTime
    && areLocationsCreatingCluster(firstLocationInBuffer, thirdLocationInBuffer)
  ) {
    // create new cluster with first point from buffer.
    await createCluster(clustersDB, firstLocationInBuffer);
  } else {
    // else if doesn't belong to third point in buffer save first location as jitter
    await AsyncStorage.setItem(CLUSTER_JITTER_LOCATION, 'true');
  }
};

const isLocationWithinClusterTimeline = async (cluster: Cluster, location: DBLocation) => {
  const jitterLocation = JSON.stringify(await AsyncStorage.getItem(CLUSTER_JITTER_LOCATION) || 'false');

  // check if a jitter point exist and it completes the timeline of the cluster and the location
  return cluster.endTime === location.startTime || jitterLocation;
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
  const updatedLong = ((cluster.long * cluster.long) + location.long) / (cluster.size + 1);

  const clusterLocationsData: Array<{ lat: number, long: number }> = JSON.parse(await AsyncStorage.getItem(CURRENT_CLUSTER_LOCATIONS_DATA) || '[]');
  const clusterLocationsDataWithNewLocation = [...clusterLocationsData, { lat: location.lat, long: location.long }];

  const start = {
    latitude: updatedLat,
    longitude: updatedLong
  };

  const clusterRadii: number[] = clusterLocationsDataWithNewLocation.map(({ lat, long }) => haversine(start, { latitude: lat, longitude: long }, { unit: config().bufferUnits }));

  const updatedRadius = _.max(clusterRadii);

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
  const { lat, long, startTime, endTime, geoHash }: DBLocation = location;
  await clustersDB.addCluster({ lat, long, startTime, endTime, geoHash: geoHash.slice(0, 7), size: 1 });
  await AsyncStorage.removeItem(CLUSTER_JITTER_LOCATION);
};
