import BackgroundFetch from 'react-native-background-fetch';
import config from '../config/config';
import { checkSickPeople } from './Tracker';
import { onError } from './ErrorService';

export const scheduleTask = async () => {
  try {
    BackgroundFetch.configure(
      {
        minimumFetchInterval: config().fetchMilliseconds / 60000,
        // Android options
        stopOnTerminate: false,
        startOnBoot: true,
        enableHeadless: true
      },
      async () => {
        console.log('Background fetch event fired');
        await checkSickPeople();
        BackgroundFetch.finish(BackgroundFetch.FETCH_RESULT_NEW_DATA);
      },
      (error: any) => onError({ error })
    );
  } catch (error) {
    onError({ error });
  }
};
