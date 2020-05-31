import { NativeEventEmitter, Clipboard, Alert } from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
// @ts-ignore
import SpecialBle from 'rn-contact-tracing';
import { IS_IOS } from '../constants/Constants';
import { onError } from './ErrorService';
import { downloadAndVerifySigning } from './SigningService';
import config from '../config/config';

export const initBLETracing = Promise.resolve

export const registerBLEListeners = () => {}

export const fetchInfectionDataByConsent = async () => new Promise(async (resolve) => {
  try {
    SpecialBle.fetchInfectionDataByConsent((res: any) => {
      const parsedRes = JSON.parse(res || '[]');
      resolve(parsedRes);
    });
  } catch (error) {
    resolve([]);
    onError({ error });
  }
});


export const match = async () => new Promise(async (resolve) => {
  try {
    const responseJson = await downloadAndVerifySigning(config().BLE_UTC);

    SpecialBle.match(JSON.stringify(responseJson), (res: string) => {
      const parsedRes: any[] = JSON.parse(res || '[]');

      resolve(parsedRes);
    });
  } catch (error) {

    resolve([]);
    onError({ error });
  }
});
