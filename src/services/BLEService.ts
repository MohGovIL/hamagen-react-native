import { NativeEventEmitter } from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
// @ts-ignore
import SpecialBle from 'rn-contact-tracing';
import UUIDGenerator from 'react-native-uuid-generator';
import { IS_IOS, UUID_KEY } from '../constants/Constants';
import { onError } from './ErrorService';

export const initBLETracing = () => new Promise(async (resolve) => {
  try {
    const UUID = await getUUID();

    let config: any = {
      serviceUUID: UUID,
      scanDuration: 10000,
      scanInterval: 10000,
      advertiseInterval: 10000,
      advertiseDuration: 10000,
      advertiseMode: 0,
      token: UUID
    };

    if (!IS_IOS) {
      config = {
        ...config,
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

export const getUUID = () => new Promise(async (resolve, reject) => {
  try {
    let uuid;

    uuid = await AsyncStorage.getItem(UUID_KEY);

    if (!uuid) {
      uuid = await UUIDGenerator.getRandomUUID();
      await AsyncStorage.setItem(UUID_KEY, uuid);
    }

    resolve(uuid);
  } catch (e) {
    reject(e);
  }
});

export const registerBLEListeners = () => {
  const eventEmitter = new NativeEventEmitter(SpecialBle);
  eventEmitter.addListener('scanningStatus', (status) => {
    debugger;
    // TODO handle ble event
  });

  eventEmitter.addListener('advertisingStatus', (status) => {
    debugger;
    // TODO handle ble event
  });
};
