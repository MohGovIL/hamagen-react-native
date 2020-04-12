import mockAsyncStorage from '@react-native-community/async-storage/jest/async-storage-mock';
import { NativeModules } from 'react-native';

global.fetch = require('jest-fetch-mock');

NativeModules.RNCNetInfo = {
  getCurrentState: jest.fn(() => Promise.resolve()),
  addListener: jest.fn(),
  removeListeners: jest.fn(),
  getBundleId: jest.fn()
};

NativeModules.SettingsManager = {
  settings: {
    AppleLocale: 'he'
  }
};

NativeModules.I18nManager = {
  localeIdentifier: 'he'
};

jest.mock('@react-native-community/async-storage', () => mockAsyncStorage);

jest.mock('../src/services/ErrorService', () => ({
  onError: jest.fn()
  // onError: jest.fn(e => console.log(e))
}))

jest.mock('../src/database/Database.js', () => {
  
  const containsObjectID = jest.fn()
  const addSickRecord = jest.fn()

  const IntersectionSickDatabase = jest.fn().mockImplementation(() => ({
    containsObjectID,
     addSickRecord
  }))

  const containsWifiHash = jest.fn()
  const addWifiMacAddresses = jest.fn()
  const WifiMacAddressDatabase =  jest.fn().mockImplementation(() => ({
    containsWifiHash,
    addWifiMacAddresses
  }))

  const updateLastSampleEndTime = jest.fn()
  const addSample = jest.fn()
  const listSamples = jest.fn()
  const purgeSamplesTable = jest.fn()
  const getLastPointEntered = jest.fn()

  const UserLocationsDatabase = jest.fn().mockImplementation(() => ({
      updateLastSampleEndTime,
      addSample,
      listSamples,
      purgeSamplesTable,
      getLastPointEntered
  }))

  return { 
    UserLocationsDatabase,
    WifiMacAddressDatabase, 
    IntersectionSickDatabase,
    containsObjectID,
    addSickRecord,
    containsWifiHash,
    addWifiMacAddresses,
    updateLastSampleEndTime,
    addSample,
    listSamples,
    purgeSamplesTable,
    getLastPointEntered,
    mockClear(){
      UserLocationsDatabase.mockClear()
      WifiMacAddressDatabase.mockClear()
      IntersectionSickDatabase.mockClear()
    } 
};
  
});

jest.mock('react-native-device-info', () => {
  return {
    getVersion: jest.fn(() => Promise.resolve('1.0')),
    getApplicationName: jest.fn(() => Promise.resolve('My App')),
    getBundleId: jest.fn()
  };
});


jest.mock('react-native-background-timer', () => {
  return {
    runBackgroundTimer: jest.fn()
  };
});


jest.mock('../src/config/config.ts', () => {
  const originalModule = require('../src/config/default_config.json');
  return {
    __esModule: true,
    namedExport: jest.fn(),
    "locationServiceIgnoreConfidenceThreshold": 80,
    "locationServiceIgnoreSampleVelocityThreshold": 2.8,
    default: jest.fn(() => originalModule['com.hamagen']),
  };
});

jest.mock('../src/store.ts', () => {
  const dispatch = jest.fn(() => ({
    locale: 'he',
    notificationData: {
      androidNotification: {},
      sickMessage: {
        he: {
          title: 'כותרת',
          body: 'הודעה'
        }
      }
    }
  }));

  const store = jest.fn().mockImplementation(() => ({ dispatch }))

  return {
    __esModule: true,
    namedExport: jest.fn(),
    default: store,
    dispatch
  };
});
