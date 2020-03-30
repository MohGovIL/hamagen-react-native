import axios from 'axios';
import AsyncStorage from '@react-native-community/async-storage';
import { NativeModules } from 'react-native';
import { onError } from '../services/ErrorService';
import LocaleData from '../locale/LocaleData';
import config from '../config/config';
import { TOGGLE_CHANGE_LANGUAGE, LOCALE_CHANGED, INIT_LOCALE } from '../constants/ActionTypes';
import { CURRENT_LOCALE, IS_IOS } from '../constants/Constants';

export const toggleChangeLanguage = (isShow: boolean) => (dispatch: any) => dispatch({ type: TOGGLE_CHANGE_LANGUAGE, payload: isShow });

export const initLocale = () => async (dispatch: any) => {
  try {
    const locale = IS_IOS ? NativeModules.SettingsManager.settings.AppleLocale : NativeModules.I18nManager.localeIdentifier;

    let activeLocale: 'he'|'iw'|'en'|'ar'|'am'|'ru'|'fr' = (await AsyncStorage.getItem(CURRENT_LOCALE) || locale).substr(0, 2);

    if (activeLocale === 'iw') {
      activeLocale = 'he';
    }

    await AsyncStorage.setItem(CURRENT_LOCALE, activeLocale);

    const { data } = await axios.get(`${config().stringsUrl}?r=${Math.random()}`, { headers: { 'Content-Type': 'application/json;charset=utf-8' } });

    dispatch({
      type: INIT_LOCALE,
      payload: {
        strings: data[activeLocale] || data.he,
        locale: activeLocale,
        isRTL: ['he', 'ar'].includes(activeLocale),
        localeData: data
      }
    });
  } catch (error) {
    dispatch({ type: LOCALE_CHANGED, payload: { strings: LocaleData.he, locale: 'he', isRTL: true } });
    onError({ error });
  }
};

export const changeLocale = (locale: 'he'|'en'|'ar'|'am'|'ru'|'fr') => async (dispatch: any) => {
  try {
    await AsyncStorage.setItem(CURRENT_LOCALE, locale);
    dispatch({ type: LOCALE_CHANGED, payload: { locale } });
  } catch (error) {
    onError({ error });
  }
};
