import axios from 'axios';
import AsyncStorage from '@react-native-community/async-storage';
import { NativeModules } from 'react-native';
import { onError } from '../services/ErrorService';
import localeData, { LocaleData } from '../locale/LocaleData';
import config from '../config/config';
import { TOGGLE_CHANGE_LANGUAGE, LOCALE_CHANGED, INIT_LOCALE } from '../constants/ActionTypes';
import { CURRENT_LOCALE, IS_IOS } from '../constants/Constants';

export const toggleChangeLanguage = (isShow: boolean) => (dispatch: any) => dispatch({ type: TOGGLE_CHANGE_LANGUAGE, payload: isShow });

export const initLocale = () => async (dispatch: any) => {
  try {
    const activeLocale = await getActiveLocale();

    await AsyncStorage.setItem(CURRENT_LOCALE, activeLocale);

    const { data }: { data: LocaleData } = await axios.get(`${config().stringsUrl}?r=${Math.random()}`, { headers: { 'Content-Type': 'application/json;charset=utf-8' } });

    dispatch({
      type: INIT_LOCALE,
      payload: {
        languages: data.languages,
        strings: data[activeLocale] || data.he,
        locale: activeLocale,
        isRTL: ['he', 'ar'].includes(activeLocale),
        localeData: data
      }
    });
  } catch (error) {
    const activeLocale = await getActiveLocale();

    dispatch({
      type: INIT_LOCALE,
      payload: {
        languages: localeData.languages,
        strings: localeData[activeLocale],
        locale: activeLocale,
        isRTL: true,
        localeData
      }
    });

    onError({ error });
  }
};

export const changeLocale = (locale: string) => async (dispatch: any) => {
  try {
    await AsyncStorage.setItem(CURRENT_LOCALE, locale);
    dispatch({ type: LOCALE_CHANGED, payload: { locale } });
  } catch (error) {
    onError({ error });
  }
};

const getActiveLocale = () => new Promise<string>(async (resolve) => {
  const locale = IS_IOS ? NativeModules.SettingsManager.settings.AppleLocale : NativeModules.I18nManager.localeIdentifier;

  let activeLocale: string = (await AsyncStorage.getItem(CURRENT_LOCALE) || locale).substr(0, 2);

  if (activeLocale === 'iw') {
    activeLocale = 'he';
  }

  resolve(activeLocale);
});
