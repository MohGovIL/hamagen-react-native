import { check, request, PERMISSIONS, RESULTS } from 'react-native-permissions';
import BackgroundGeolocation from 'react-native-background-geolocation';
import { onError } from './ErrorService';
import config from '../config/config';
import { IS_IOS } from '../constants/Constants';

export const permission = IS_IOS ? PERMISSIONS.IOS.LOCATION_ALWAYS : PERMISSIONS.ANDROID.ACCESS_BACKGROUND_LOCATION;

export const checkPermissions = () => new Promise(async (resolve) => {
  try {
    let status;

    status = await check(permission);

    if (!IS_IOS && status === RESULTS.UNAVAILABLE) {
      status = await check(PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION);
    }

    resolve(status);
  } catch (error) {
    resolve(RESULTS.DENIED);
    onError({ error });
  }
});

export const requestPermissions = () => new Promise(async (resolve) => {
  try {
    const status = await check(permission);

    if (status !== RESULTS.GRANTED) {
      const res = await request(permission);

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

export const startLocationTracking = async () => {
  try {
    const status = await check(permission);

    if (status !== RESULTS.GRANTED) {
      const res = await request(permission);

      if (!IS_IOS && res === RESULTS.UNAVAILABLE) {
        await request(PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION);
      }
    }

    await BackgroundGeolocation.ready({
      // Geolocation Config
      desiredAccuracy: BackgroundGeolocation.DESIRED_ACCURACY_HIGH,
      distanceFilter: config().sampleDistance,
      locationUpdateInterval: config().sampleInterval,
      fastestLocationUpdateInterval: config().sampleInterval,
      disableMotionActivityUpdates: true,
      // Activity Recognition
      stopTimeout: 1,
      // Application config
      logLevel: BackgroundGeolocation.LOG_LEVEL_VERBOSE,
      stopOnTerminate: false,
      startOnBoot: true,
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
