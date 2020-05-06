import localeData from '../locale/LocaleData';
import { LocaleReducer, ReducerAction } from '../types';
import { TOGGLE_CHANGE_LANGUAGE, LOCALE_CHANGED, INIT_LOCALE } from '../constants/ActionTypes';

const INITIAL_STATE = {
  showChangeLanguage: false,
  languages: localeData.languages,
  externalUrls: localeData.externalUrls,
  notificationData: localeData.notificationData,
  strings: localeData.he,
  isRTL: false,
  locale: 'he',
  localeData
};

export default (state: LocaleReducer = INITIAL_STATE, action: ReducerAction) => {
  switch (action.type) {
    case INIT_LOCALE: {
      const { isRTL, locale, localeData, strings, languages, externalUrls, notificationData } = action.payload;
      return { ...state, isInitLocale: true, isRTL, locale, localeData, strings, languages, externalUrls, notificationData };
    }

    case TOGGLE_CHANGE_LANGUAGE: {
      return { ...state, showChangeLanguage: action.payload };
    }

    case LOCALE_CHANGED: {
      const { locale } = action.payload;
      return { ...state, strings: { ...state.localeData[locale] }, locale, isRTL: ['he', 'ar'].includes(locale) };
    }

    default:
      return state;
  }
};
