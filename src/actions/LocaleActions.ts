import AsyncStorage from '@react-native-community/async-storage';
import { NativeModules } from 'react-native';
import { downloadAndVerifySigning } from '../services/SigningService';
import { onError } from '../services/ErrorService';
import config from '../config/config';
import localeData, { LocaleData } from '../locale/LocaleData';
import { TOGGLE_CHANGE_LANGUAGE, LOCALE_CHANGED, INIT_LOCALE } from '../constants/ActionTypes';
import { CURRENT_LOCALE, IS_IOS } from '../constants/Constants';

export const toggleChangeLanguage = (isShow: boolean) => (dispatch: any) => dispatch({ type: TOGGLE_CHANGE_LANGUAGE, payload: isShow });

export const initLocale = () => async (dispatch: any) => {
  try {
    const activeLocale = await getActiveLocale();

    await AsyncStorage.setItem(CURRENT_LOCALE, activeLocale);

    const data: LocaleData = await downloadAndVerifySigning(config().stringsUrl+'123');

    const { languages, notificationData, externalUrls } = data;

    dispatch({
      type: INIT_LOCALE,
      payload: {
        languages,
        notificationData,
        externalUrls,
        strings: data[activeLocale] || data.he,
        locale: activeLocale,
        isRTL: ['he', 'ar'].includes(activeLocale),
        localeData: data
      }
    });

    return Promise.resolve({ locale: activeLocale, notificationData });
  } catch (error) {
    const activeLocale = await getActiveLocale();
    const { languages, externalUrls, notificationData } = localeData;

    dispatch({
      type: INIT_LOCALE,
      payload: {
        languages,
        externalUrls,
        notificationData,
        strings: localeData[activeLocale],
        locale: activeLocale,
        isRTL: ['he', 'ar'].includes(activeLocale),
        localeData
      }
    });

    onError({ error });

    return Promise.resolve({ locale: activeLocale, notificationData });
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
  let locale = IS_IOS ? NativeModules.SettingsManager.settings.AppleLocale : NativeModules.I18nManager.localeIdentifier;

  if (locale === undefined) {
    // eslint-disable-next-line prefer-destructuring
    locale = NativeModules.SettingsManager.settings.AppleLanguages[0];
  }

  let activeLocale: string = (await AsyncStorage.getItem(CURRENT_LOCALE) || locale).substr(0, 2);

  if (activeLocale === 'iw') {
    activeLocale = 'he';
  }

  resolve(activeLocale);
});
