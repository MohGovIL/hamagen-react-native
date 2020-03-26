import { Method } from 'axios';

export interface Config {
  sampleDistance: number,
  sampleInterval: number,
  dataUrl: string,
  stringsUrl: string,
  versionsUrl: string,
  fetchMilliseconds: number,
  meterRadius: number,
  intersectMilliseconds: number,
  bufferUnits: string,
  sickGeometryLongIndex: number,
  sickGeometryLatIndex: number,
  locationHistoryIgnoreList: string[],
  sickMessage: {
    he: { title: string, body: string },
    en: { title: string, body: string },
    am: { title: string, body: string },
    ru: { title: string, body: string },
    ar: { title: string, body: string },
    duration: number
  },
  furtherInstructions: {
    he: string,
    en: string,
    am: string,
    ru: string,
    ar: string
  },
  reportForm: {
    he: string,
    en: string,
    am: string,
    ru: string,
    ar: string
  },
  usageTerms: {
    he: string,
    en: string,
    am: string,
    ru: string,
    ar: string
  },
  privacyTerms: {
    he: string,
    en: string,
    am: string,
    ru: string,
    ar: string
  }
}

export interface ReducerAction {
  type: string,
  payload: any
}

export interface RequestWrapperPayload {
  method: Method,
  url: string,
  params?: any,
  isAnonymous?: boolean
}

export interface ErrorService {
  error: any,
  actionType?: string,
  dispatch?: (params: any) => void,
  customAction?: () => void,
  showError?: boolean
}

export interface Locale {
  locale: 'he'|'en'|'ar'|'am'|'ru',
  isRTL: boolean,
  strings: any
}

export interface Fonts {
  [key: string]: string
}

export interface Exposure {
  properties: {
    OBJECTID: number,
    Name: string,
    Place: string,
    fromTime: number,
    toTime: number
  },
  geometry: {
    type: string,
    coordinates: number[]
  }
}

export interface DBExposure {
  OBJECTID: number,
  Name: string,
  Place: string,
  fromTime: number,
  toTime: number
}

export interface ValidExposure {
  exposure: Exposure,
  timestamp: number
}
