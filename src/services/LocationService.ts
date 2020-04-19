import { check, request, PERMISSIONS, RESULTS } from 'react-native-permissions';
import BackgroundGeolocation from 'react-native-background-geolocation';
import moment from 'moment';
import AsyncStorage from '@react-native-community/async-storage';
import { UserLocationsDatabase } from '../database/Database';
import { onError } from './ErrorService';
import config from '../config/config';
import { NotificationData } from '../locale/LocaleData';
import { DID_UPDATE_LOCATIONS_TIME_TO_UTC, IS_IOS, MOTION_PERMISSION_CALL_TO_ACTION } from '../constants/Constants';

export const locationPermission = IS_IOS ? PERMISSIONS.IOS.LOCATION_ALWAYS : PERMISSIONS.ANDROID.ACCESS_BACKGROUND_LOCATION;
export const motionPermission = IS_IOS ? PERMISSIONS.IOS.MOTION : PERMISSIONS.ANDROID.ACTIVITY_RECOGNITION;

export const checkLocationPermissions = () => new Promise(async (resolve) => {
  try {
    let status;

    status = await check(locationPermission);

    if (!IS_IOS && status === RESULTS.UNAVAILABLE) {
      status = await check(PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION);
    }

    resolve(status);
  } catch (error) {
    resolve(RESULTS.DENIED);
    onError({ error });
  }
});

export const requestLocationPermissions = () => new Promise(async (resolve) => {
  try {
    const status = await check(locationPermission);

    if (status !== RESULTS.GRANTED) {
      const res = await request(locationPermission);

      if (!IS_IOS && res === RESULTS.UNAVAILABLE) {
        await request(PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION);
      }
    }

    resolve();
  } catch (error) {
    resolve();
    onError({ error });
  }
});

export const checkMotionPermissions = () => new Promise(async (resolve) => {
  try {
    const res = await check(motionPermission);
    resolve(res);
  } catch (error) {
    resolve(false);
    onError({ error });
  }
});

export const requestMotionPermissions = (updateService: boolean) => new Promise(async (resolve) => {
  try {
    const res = await request(motionPermission);

    if (updateService && (res === RESULTS.GRANTED || res === RESULTS.UNAVAILABLE)) {
      await BackgroundGeolocation.setConfig({ disableMotionActivityUpdates: false });
    }

    resolve(res === RESULTS.GRANTED);
  } catch (error) {
    resolve(RESULTS.BLOCKED);
    onError({ error });
  }
});

export const goToFilterDrivingIfNeeded = async (navigation: any) => {
  try {
    const res = await checkMotionPermissions();

    if (res === RESULTS.BLOCKED || res === RESULTS.GRANTED || res === RESULTS.UNAVAILABLE) {
      return;
    }

    const motionPermissionCTA = JSON.parse(await AsyncStorage.getItem(MOTION_PERMISSION_CALL_TO_ACTION) || 'false');

    if (!motionPermissionCTA || ((motionPermissionCTA.tries < 5) && (moment(motionPermissionCTA.lastTry).diff(moment(), 'days') > 5))) {
      navigation.navigate('FilterDriving');
    }
  } catch (error) {
    onError({ error });
  }
};

export const onMotionPermissionSkipped = async () => {
  try {
    const motionPermissionCTA = JSON.parse(await AsyncStorage.getItem(MOTION_PERMISSION_CALL_TO_ACTION) || 'false');

    const updatedTries = motionPermissionCTA ? motionPermissionCTA.tries + 1 : 1;

    await AsyncStorage.setItem(MOTION_PERMISSION_CALL_TO_ACTION, JSON.stringify({ tries: updatedTries, lastTry: moment().valueOf() }));
  } catch (error) {
    onError({ error });
  }
};

export const startLocationTracking = async (locale: string, notificationData: NotificationData) => {
  try {
    const status = await check(locationPermission);

    if (status !== RESULTS.GRANTED) {
      const res = await request(locationPermission);

      if (!IS_IOS && res === RESULTS.UNAVAILABLE) {
        await request(PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION);
      }
    }

    const motionPermissions = await checkMotionPermissions();
    const disableMotionActivityUpdates = (motionPermissions !== RESULTS.GRANTED && motionPermissions !== RESULTS.UNAVAILABLE);

    await BackgroundGeolocation.ready({
      // Geolocation Config
      desiredAccuracy: BackgroundGeolocation.DESIRED_ACCURACY_HIGH,
      distanceFilter: config().sampleDistance,
      locationUpdateInterval: config().sampleInterval,
      fastestLocationUpdateInterval: config().sampleInterval,
      // Activity Recognition
      disableMotionActivityUpdates,
      stopTimeout: 1,
      // Application config
      logLevel: BackgroundGeolocation.LOG_LEVEL_VERBOSE,
      stopOnTerminate: false,
      startOnBoot: true,
      foregroundService: true,
      notification: {
        text: notificationData.androidNotification[locale]
      },
      enableHeadless: true
    }, (state) => {
      console.log('BackgroundGeolocation is configured and ready: ', state.enabled);

      if (!state.enabled) {
        // //
        // 3. Start tracking!
        //
        BackgroundGeolocation.start(() => {
          console.log('react-native-background-geolocation - Start success');
        });
      }
    });
  } catch (error) {
    onError({ error });
  }
};

export const updateLocationsTimesToUTC = () => new Promise(async (resolve) => {
  try {
    const didUpdate = await AsyncStorage.getItem(DID_UPDATE_LOCATIONS_TIME_TO_UTC);

    if (!didUpdate) {
      const db = new UserLocationsDatabase();
      await db.updateSamplesToUTC();
      await AsyncStorage.setItem(DID_UPDATE_LOCATIONS_TIME_TO_UTC, 'true');
    }

    resolve();
  } catch (error) {
    resolve();
    onError({ error });
  }
});
