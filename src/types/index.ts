export interface Config {
  sampleDistance: number,
  sampleInterval: number,
  dataUrl: string,
  dataUrl_utc: string,
  stringsUrl: string,
  versionsUrl: string,
  fetchMilliseconds: number,
  meterRadius: number,
  intersectMilliseconds: number,
  bufferUnits: string,
  sickGeometryLongIndex: number,
  sickGeometryLatIndex: number,
  locationHistoryIgnoreList: string[],
  androidNotification: { he: string, en: string, am: string, ru: string, ar: string, fr: string },
  sickMessage: {
    he: { title: string, body: string },
    en: { title: string, body: string },
    am: { title: string, body: string },
    ru: { title: string, body: string },
    ar: { title: string, body: string },
    fr: { title: string, body: string }
    duration: number
  },
  furtherInstructions: {
    he: string,
    en: string,
    am: string,
    ru: string,
    ar: string,
    fr: string
  },
  reportForm: {
    he: string,
    en: string,
    am: string,
    ru: string,
    ar: string,
    fr: string
  },
  usageTerms: {
    he: string,
    en: string,
    am: string,
    ru: string,
    ar: string,
    fr: string
  },
  privacyTerms: {
    he: string,
    en: string,
    am: string,
    ru: string,
    ar: string,
    fr: string
  }
}

export interface ReducerAction {
  type: string,
  payload: any
}

export interface ErrorService {
  error: any,
  actionType?: string,
  dispatch?: (params: any) => void,
  customAction?: () => void,
  showError?: boolean
}

export interface Locale {
  locale: 'he'|'en'|'ar'|'am'|'ru'|'fr',
  isRTL: boolean,
  strings: any
}

export interface Fonts {
  [key: string]: string
}

export interface SickJSON {
  type: string,
  features: Exposure[]
}

export interface Exposure {
  properties: {
    OBJECTID: number,
    Key_Field: number,
    Name: string,
    Place: string,
    fromTime: number,
    fromTime_utc: number,
    toTime: number,
    toTime_utc: number,
    radius?: number
  },
  geometry: {
    type: string,
    coordinates: number[],
    radius?: number
  }
}

export interface Location {
  geoHash: string,
  hash: string,
  endTime: number,
  wifiHash: string,
  accuracy: number,
  lat: number,
  startTime: number,
  long: number
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
