import localeData, { ExternalUrls, Languages, LocaleData, NotificationData, Strings } from '../locale/LocaleData';
import { ReducerAction } from '../types';
import { TOGGLE_CHANGE_LANGUAGE, LOCALE_CHANGED, INIT_LOCALE } from '../constants/ActionTypes';

interface LocaleReducer {
  showChangeLanguage: boolean,
  languages: Languages|{},
  externalUrls: ExternalUrls|{},
  notificationData: NotificationData|{},
  strings: Strings|{},
  isRTL: boolean,
  locale: string,
  localeData: LocaleData
}

const INITIAL_STATE = {
  showChangeLanguage: false,
  languages: {},
  externalUrls: {},
  notificationData: {},
  strings: {},
  isRTL: false,
  locale: 'he',
  localeData
};

export default (state: LocaleReducer = INITIAL_STATE, action: ReducerAction) => {
  switch (action.type) {
    case INIT_LOCALE: {
      const { isRTL, locale, localeData, strings, languages, externalUrls, notificationData } = action.payload;
      return { ...state, isRTL, locale, localeData, strings, languages, externalUrls, notificationData };
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
