import axios from 'axios';
import AsyncStorage from '@react-native-community/async-storage';
import { onError } from '../services/ErrorService';
import config from '../config/config';
import { TOGGLE_LOADER, TOGGLE_WEBVIEW, SHOW_FORCE_UPDATE, SHOW_FORCE_TERMS } from '../constants/ActionTypes';
import { CURRENT_VERSION, CURRENT_TERMS_VERSION, IS_IOS } from '../constants/Constants';

export const toggleLoader = (isShow: boolean) => (dispatch: any) => dispatch({ type: TOGGLE_LOADER, payload: { isShow } });

export const toggleWebview = (isShow: boolean, usageType:string) => (dispatch: any) => dispatch({ type: TOGGLE_WEBVIEW, payload: { isShow, usageType } });

export const checkForceUpdate = () => async (dispatch: any) => {
  try {
    const { data: { ios, android, terms } } = await axios.get(`${config.versionsUrl}?r=${Math.random()}`, { headers: { 'Content-Type': 'application/json;charset=utf-8' } });

    const termsVersion = JSON.parse(await AsyncStorage.getItem(CURRENT_TERMS_VERSION) || '0');

    if (!termsVersion) {
      await AsyncStorage.setItem(CURRENT_TERMS_VERSION, JSON.stringify(terms));
    } else if ((termsVersion !== 0) && (termsVersion < terms)) {
      return dispatch({ type: SHOW_FORCE_TERMS, payload: { terms } });
    }

    const currentVersion = IS_IOS ? ios : android;

    const appVersion = JSON.parse(await AsyncStorage.getItem(CURRENT_VERSION) || '0');

    if (!appVersion) {
      await AsyncStorage.setItem(CURRENT_VERSION, JSON.stringify(currentVersion));
    } else if ((appVersion !== 0) && (appVersion < currentVersion)) {
      dispatch({ type: SHOW_FORCE_UPDATE });
    }
  } catch (error) {
    onError({ error });
  }
};
