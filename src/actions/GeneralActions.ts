import axios from 'axios';
import AsyncStorage from '@react-native-community/async-storage';
import DeviceInfo from 'react-native-device-info';
import moment from 'moment';
import { onError } from '../services/ErrorService';
import config from '../config/config';
import {
  TOGGLE_LOADER,
  TOGGLE_WEBVIEW,
  SHOW_FORCE_UPDATE,
  SHOW_FORCE_TERMS,
  HIDE_LOCATION_HISTORY
} from '../constants/ActionTypes';
import { CURRENT_TERMS_VERSION, FIRST_POINT_TS, IS_IOS, SHOULD_HIDE_LOCATION_HISTORY } from '../constants/Constants';

export const toggleLoader = (isShow: boolean) => (dispatch: any) => dispatch({ type: TOGGLE_LOADER, payload: { isShow } });

export const toggleWebview = (isShow: boolean, usageType:string) => (dispatch: any) => dispatch({ type: TOGGLE_WEBVIEW, payload: { isShow, usageType } });

export const checkForceUpdate = () => async (dispatch: any) => {
  try {
    const { data: { ios, android, shouldForceIOS, shouldForceAndroid, terms } } = await axios.get(`${config().versionsUrl}?r=${Math.random()}`, { headers: { 'Content-Type': 'application/json;charset=utf-8' } });

    const termsVersion = JSON.parse(await AsyncStorage.getItem(CURRENT_TERMS_VERSION) || '0');

    if (!termsVersion) {
      await AsyncStorage.setItem(CURRENT_TERMS_VERSION, JSON.stringify(terms));
    } else if ((termsVersion !== 0) && (termsVersion < terms)) {
      return dispatch({ type: SHOW_FORCE_TERMS, payload: { terms } });
    }

    const serverVersion = (IS_IOS ? ios : android).split('.').map((level: string) => parseFloat(level));
    const appVersion = DeviceInfo.getVersion().split('.').map((level: string) => parseFloat(level));
    const shouldForce = IS_IOS ? shouldForceIOS : shouldForceAndroid;

    if (shouldForce && isOlderVersion(serverVersion, appVersion)) {
      dispatch({ type: SHOW_FORCE_UPDATE });
    }
  } catch (error) {
    onError({ error });
  }
};

const isOlderVersion = (serverVersion: number[], appVersion: number[]) => {
  for (let i = 0; i < serverVersion.length; i++) {
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
