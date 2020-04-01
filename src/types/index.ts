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
  locationHistoryIgnoreList: string[]
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

export interface ValidExposure {
  exposure: Exposure,
  timestamp: number
}
