import { NativeEventEmitter } from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
// @ts-ignore
import SpecialBle from 'rn-contact-tracing';
import { DID_ADDED_BLE_DATA_TO_DB, IS_IOS } from '../constants/Constants';
import { onError } from './ErrorService';

export const initBLETracing = () => new Promise(async (resolve) => {
  try {
    const UUID = '00000000-0000-1000-8000-00805F9B34FB';

    // TODO move to config
    let config: any = {
      serviceUUID: UUID,
      scanDuration: 60000,
      scanInterval: 240000,
      advertiseInterval: 45000,
      advertiseDuration: 10000,
      token: 'default_token'
    };

    if (!IS_IOS) {
      config = {
        ...config,
        advertiseMode: 0,
        advertiseTXPowerLevel: 3,
        scanMatchMode: 1,
        notificationTitle: '',
        notificationContent: 'סריקת BLE פועלת'
      };
    }

    await SpecialBle.setConfig(config);
    IS_IOS ? await SpecialBle.startBLEService(UUID) : await SpecialBle.startBLEService();

    resolve();
  } catch (error) {
    resolve();
    onError({ error });
  }
});

export const registerBLEListeners = () => {
  const eventEmitter = new NativeEventEmitter(SpecialBle);
  eventEmitter.addListener('scanningStatus', (status) => {
    // TODO handle ble event
  });

  eventEmitter.addListener('advertisingStatus', (status) => {
    // TODO handle ble event
  });
};

export const fetchInfectionDataByConsent = () => {
  SpecialBle.fetchInfectionDataByConsent((res: any) => {
    const parsedRes = JSON.parse(res || '[]');
  });
};

export const match = (data: string) => {
  const json = require('./exampleJsons/outputserverReponse.json');
  SpecialBle.match(JSON.stringify(json), (res: any) => {
    const parsedRes = JSON.parse(res || '[]');
  });
};

export const addDataToBLEDB = async () => {
  try {
    const res = JSON.parse(await AsyncStorage.getItem(DID_ADDED_BLE_DATA_TO_DB) || 'false');

    if (!res) {
      SpecialBle.writeContactsToDB(null);
      await AsyncStorage.setItem(DID_ADDED_BLE_DATA_TO_DB, 'true');
    }
  } catch (error) {
    onError({ error });
  }
};
