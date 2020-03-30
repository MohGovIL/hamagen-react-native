import LocaleData from '../locale/LocaleData';
import { ReducerAction } from '../types';
import { TOGGLE_CHANGE_LANGUAGE, LOCALE_CHANGED, INIT_LOCALE } from '../constants/ActionTypes';

interface LocaleReducer {
  showChangeLanguage: boolean,
  strings: any,
  isRTL: boolean,
  locale: 'he'|'en'|'ar'|'am'|'ru'|'fr'|undefined,
  localeData: { he: any, en: any, ar: any, am: any, ru: any, fr:any }
}

const INITIAL_STATE = {
  showChangeLanguage: false,
  strings: {},
  isRTL: false,
  locale: undefined,
  localeData: LocaleData
};

export default (state: LocaleReducer = INITIAL_STATE, action: ReducerAction) => {
  switch (action.type) {
    case INIT_LOCALE: {
      const { isRTL, locale, localeData, strings } = action.payload;
      return { ...state, isRTL, locale, localeData, strings };
    }
    case TOGGLE_CHANGE_LANGUAGE: {
      return { ...state, showChangeLanguage: action.payload };
    }

    case LOCALE_CHANGED: {
      const { locale }: { locale: 'he'|'en'|'ar'|'am'|'ru'|'fr' } = action.payload;
      return { ...state, strings: { ...state.localeData[locale] }, locale, isRTL: ['he', 'ar'].includes(locale) };
    }

    default:
      return state;
  }
};
