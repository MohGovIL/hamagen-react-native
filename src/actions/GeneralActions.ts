import AsyncStorage from '@react-native-community/async-storage';
import DeviceInfo from 'react-native-device-info';
import moment from 'moment';
import { downloadAndVerifySigning } from '../services/SigningService';
import { onError } from '../services/ErrorService';
import config from '../config/config';
import {
  TOGGLE_LOADER,
  TOGGLE_WEBVIEW,
  SHOW_FORCE_UPDATE,
  SHOW_FORCE_TERMS,
  HIDE_LOCATION_HISTORY,
  SHOW_MAP_MODAL,
  ENABLE_BLE
} from '../constants/ActionTypes';

import { CURRENT_TERMS_VERSION, FIRST_POINT_TS, IS_IOS, SHOULD_HIDE_LOCATION_HISTORY, USER_AGREE_TO_BLE, ENABLE_BLE as ENABLE_BLE_IN_APP } from '../constants/Constants';
import { Exposure } from '../types';

export const toggleLoader = (isShow: boolean) => (dispatch: any) => dispatch({ type: TOGGLE_LOADER, payload: { isShow } });

export const toggleWebview = (isShow: boolean, usageType:string) => (dispatch: any) => dispatch({ type: TOGGLE_WEBVIEW, payload: { isShow, usageType } });

export const checkForceUpdate = () => async (dispatch: any) => {
  try {
    const { v2: { ios, android, shouldForceIOS, shouldForceAndroid, terms } } = await downloadAndVerifySigning(config().versionsUrl);

    const termsVersion = JSON.parse(await AsyncStorage.getItem(CURRENT_TERMS_VERSION) || '0');

    if (!termsVersion) {
      await AsyncStorage.setItem(CURRENT_TERMS_VERSION, JSON.stringify(terms));
    } else if ((termsVersion !== 0) && (termsVersion < terms)) {
      return dispatch({ type: SHOW_FORCE_TERMS, payload: { terms } });
    }

    const serverVersion = (IS_IOS ? ios : android).split('.').map((level: string) => parseFloat(level));
    const appVersion = DeviceInfo.getVersion().split('.').map((level: string) => parseFloat(level));
    const shouldForce = IS_IOS ? shouldForceIOS : shouldForceAndroid;

    if (isOlderVersion(serverVersion, appVersion)) {
      dispatch({ type: SHOW_FORCE_UPDATE, payload: { shouldForce } });
    }
  } catch (error) {
    onError({ error });
  }
};

const isOlderVersion = (serverVersion: number[], appVersion: number[]) => {
  for (let i = 0; i < serverVersion.length; i++) {
    if (appVersion[i] > serverVersion[i]) {
      return false;
    }

    if (serverVersion[i] > appVersion[i]) {
      return true;
    }
  }

  return false;
};

export const checkIfHideLocationHistory = () => async (dispatch: any) => {
  try {
    const firstPointTS = JSON.parse(await AsyncStorage.getItem(FIRST_POINT_TS) || 'false');
    const shouldHide = await AsyncStorage.getItem(SHOULD_HIDE_LOCATION_HISTORY);

    if (shouldHide || (firstPointTS && (moment().diff(moment(firstPointTS), 'days') > 14))) {
      dispatch({ type: HIDE_LOCATION_HISTORY });
    }
  } catch (error) {
    onError({ error });
  }
};

export const checkIfBleEnabled = () => async (dispatch: any) => {
  // await AsyncStorage.removeItem(USER_AGREE_TO_BLE)

  
  if (IS_IOS || !ENABLE_BLE_IN_APP) {
    dispatch({ type: ENABLE_BLE, payload: false });
  } else {
    try {
      let payload = await AsyncStorage.getItem(USER_AGREE_TO_BLE);
      
      if (payload) {
        payload = JSON.parse(payload);
      }
      dispatch({ type: ENABLE_BLE, payload });
    } catch (error) {
      onError({ error });
      dispatch({ type: ENABLE_BLE, payload: null });
    }
  }
};

export const showMapModal = ({ properties }: Exposure) => {
  let latitude = 0;
  let longitude = 0;

  if (typeof properties.lat === 'string') { latitude = parseFloat(properties.lat); } else if (typeof properties.lat === 'number') { latitude = properties.lat; }

  if (typeof properties.long === 'string') { longitude = parseFloat(properties.long); } else if (typeof properties.long === 'number') { longitude = properties.long; }

  return ({
    type: SHOW_MAP_MODAL,
    payload: {
      properties,
      region: {
        latitude,
        longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.001,
      }
    }
  });
};
