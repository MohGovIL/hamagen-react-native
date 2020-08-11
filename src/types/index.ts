import moment from 'moment';
import { Region } from 'react-native-maps';
import { ExternalUrls, Languages, LocaleData, NotificationData, Strings } from '../locale/LocaleData';

export interface Config {
  sampleDistance: number,
  sampleInterval: number,
  dataUrl: string,
  dataUrl_utc: string,
  BleDataUrl_utc: string,
  stringsUrl: string,
  versionsUrl: string,
  dataShareUrl: string,
  fetchMilliseconds: number,
  minimumBLEFetchIntervalMin: number,
  minimumGeoFetchIntervalMin: number,
  meterRadius: number,
  clusterRadius: number,
  jitterValue: number,
  jitterUnits: moment.unitOfTime.Diff,
  intersectMilliseconds: number,
  intersectMillisecondsWithCluster: number,
  intersectWithClusters: boolean,
  dataShareClusters: boolean,
  bufferUnits: string,
  sickGeometryLongIndex: number,
  sickGeometryLatIndex: number,
  locationServiceIgnoreList: string[],
  locationServiceIgnoreConfidenceThreshold: number,
  locationServiceIgnoreSampleVelocityThreshold: number,
  locationHistoryIgnoreList: string[],
  notificationTopic: string,
  BLENotificationTitle: {
    [languageKey: string]: string
  },
  BLENotificationContent: {
    [languageKey: string]: string
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
  showError?: boolean,
  messageToShow?: string
}

export interface Fonts {
  [key: string]: string
}

export interface SickJSON {
  type: string,
  features: Exposure[]
}

export interface ExposureProperties {
  OBJECTID: number,
  Key_Field: number,
  Name: string,
  Place: string,
  fromTime: number,
  fromTime_utc: number,
  toTime: number,
  toTime_utc: number,
  radius?: number,
  geohashFilter: string,
  lat?: number,
  long?: number,
  wasThere?: boolean,
  BLETimestamp?: number
}

export interface ExposureGeometry {
  type: string,
  coordinates: number[],
  radius?: number
}

export interface Exposure {
  properties: ExposureProperties,
  geometry: ExposureGeometry
}

export interface Sample {
  activity: {
    type: string,
    confidence: number
  },
  coords: {
    latitude: number,
    longitude: number,
    accuracy: number,
    speed: number
  },
  is_moving: boolean,
  timestamp: number
}

export interface DBLocation {
  lat: number,
  long: number,
  _long?: number,
  accuracy: number,
  startTime: number,
  endTime: number,
  geoHash: string,
  wifiHash: string,
  hash: string
}

export interface Location {
  geoHash: string,
  hash: string,
  endTime: number,
  wifiHash: string,
  accuracy: number,
  lat: number,
  startTime: number,
  radius: number,
  long: number
}

export interface ValidExposure {
  exposure: Exposure,
  timestamp: number
}

export interface VelocityRecord {
  distMeter: number,
  timeDiff: number,
  velocity: number,
}

export interface Store {
  general: GeneralReducer,
  locale: LocaleReducer,
  exposures: ExposuresReducer
}

export interface GeneralReducer {
  showLoader: boolean,
  showWebview: boolean,
  showForceUpdate: boolean,
  shouldForce: boolean,
  showForceTerms: boolean,
  termsVersion: number,
  hideLocationHistory: boolean,
  enableBle: boolean | null,
  batteryDisabled: boolean | null,
  showMap: {
    visible: boolean,
    properties?: ExposureProperties,
    region: Region
  }
}

export interface ExposuresReducer {
  exposures: Exposure[],
  pastExposures: Exposure[],
  validExposure?: Exposure,
  firstPoint?: number
}

export interface LocaleReducer {
  showChangeLanguage: boolean,
  languages: Languages,
  externalUrls: ExternalUrls,
  notificationData: NotificationData,
  strings: Strings,
  isRTL: boolean,
  locale: string,
  localeData: LocaleData
}

export interface Cluster {
  lat: number,
  long: number,
  startTime: number,
  endTime: number,
  geoHash: string,
  radius: number,
  size: number
}
