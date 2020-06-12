import AsyncStorage from '@react-native-community/async-storage';
import RNFS from 'react-native-fs';
import moment from 'moment';
import { SERVICE_TRACKER, IS_IOS } from '../constants/Constants';
import { onError } from './ErrorService';


export const logToStorage = async (source: any, timestamp: number) => {
  const res = JSON.parse(await AsyncStorage.getItem(SERVICE_TRACKER) || '[]');
  await AsyncStorage.setItem(SERVICE_TRACKER, JSON.stringify([...res, { source, timestamp }]));
};

// TODO: check how to do it for IOS
export const logToFile = async (source: string, timestamp: number) => {
  if (!IS_IOS) {
    try {
      const path = `${RNFS.ExternalDirectoryPath}/logs.txt`;
      await RNFS.appendFile(path, `${source} - ${moment(timestamp).format('YY.MM.DD HH:mm:ss')} - ${timestamp}\n`, 'utf8');
    } catch (error) {
      onError({ error });
    }
  }
};

const log = async (source: string) => {
  const timestamp = moment().valueOf();
  await Promise.all([
    logToStorage(source, timestamp),
    logToFile(source, timestamp)
  ]);
};

export default log;
