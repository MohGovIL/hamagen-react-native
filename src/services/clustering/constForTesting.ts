
export const minute = 60*1000;
export const hour = 60*minute;

export const loc1 = {
    startTime: 1583144150000,
    endTime: 1583147700000,
    accuracy: 5,
    long: 34.807731241000056,
    lat: 32.115499628000066,
    geoHash: '',
    wifiHash: '',
    hash: ''
  } as const;
export const loc1Invalid = {
    startTime: 1583147700000,
    endTime: 1583147700000,
    accuracy: 5,
    long: 34.807731241000056,
    lat: 32.115499628000066,
    geoHash: '',
    wifiHash: '',
    hash: ''
  } as const;
export const loc2 = {
    startTime: 1583147700000,
    endTime: 1583147700000 + 5 * minute,
    accuracy: 10,
    long: 35.535289000000034,
    lat: 32.78675100000004,
    geoHash: '',
    wifiHash: '',
    hash: ''
  } as const;
export const loc3 = {
    startTime: 1583147700000 + 5 * minute,
    endTime: 1583147700000 + 10 * minute,
    accuracy: 10,
    long: 37.535289000000034,
    lat: 32.78675100000004,
    geoHash: '',
    wifiHash: '',
    hash: ''
  } as const;
export const loc4 = {
    startTime: 1583147700000 + 10 * minute,
    endTime: 1583147700000 + 25 * minute,
    accuracy: 10,
    long: 35.535289000000034,
    lat: 32.78675100000004,
    geoHash: '',
    wifiHash: '',
    hash: ''
  } as const;
