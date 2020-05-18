import { NativeEventEmitter, Clipboard, Alert } from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
// @ts-ignore
import SpecialBle from 'rn-contact-tracing';
import { IS_IOS } from '../constants/Constants';
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

    if (parsedRes?.infected?.length > 0) {
      const flatData = parsedRes.infected.flatMap((d: any) => d);
      Clipboard.setString(JSON.stringify(flatData));
      Alert.alert('DB copied');
      return;
    }

    Alert.alert('No results found');
  });
};

export const match = () => {
  SpecialBle.match(null, (res: any) => {
    const parsedRes: any[] = JSON.parse(res || '[]');

    if (parsedRes.length > 0) {
      Clipboard.setString(JSON.stringify(parsedRes[parsedRes.length - 1]));
      Alert.alert('Last result copied');
      return;
    }

    Alert.alert('No results found');
  });
};
