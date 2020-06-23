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
  try {
    const path = `${IS_IOS ? RNFS.DocumentDirectoryPath : RNFS.ExternalDirectoryPath}/logs.txt`;
    await RNFS.appendFile(path, `${source} - ${moment(timestamp).format('YY.MM.DD HH:mm:ss')} - ${timestamp}\n`, 'utf8');
  } catch (error) {
    onError({ error });
  }
};

export const logErrorToFile = async (error: Error | string) => {
  try {
    const path = `${IS_IOS ? RNFS.DocumentDirectoryPath : RNFS.ExternalDirectoryPath}/errors.txt`;
    await RNFS.appendFile(path, `${error.toString()} - ${moment().format('YY.MM.DD HH:mm:ss')}\n`, 'utf8');
  } catch (e) {
    console.log('error in error log service');
  }
};

export const logStartToFile = async (title: string) => {
  const path = `${IS_IOS ? RNFS.DocumentDirectoryPath : RNFS.ExternalDirectoryPath}/start.txt`;
  await RNFS.appendFile(path, `${title} - ${moment().format('YY.MM.DD HH:mm:ss')}\n`, 'utf8');
};

const log = async (source: string) => {
  const timestamp = moment().valueOf();
  await Promise.all([
    logToStorage(source, timestamp),
    logToFile(source, timestamp)
  ]);
};

export default log;
