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

jest.mock('../src/database/Database.js', () => {
  
  const IntersectionSickDatabase = jest.fn().mockImplementation(() => ({
    containsObjectID: jest.fn(),
     addSickRecord: jest.fn()
  }))

  const WifiMacAddressDatabase =  jest.fn().mockImplementation(() => ({
    containsWifiHash: jest.fn(),
    addWifiMacAddresses:jest.fn()
  }))

  const UserLocationsDatabase = jest.fn().mockImplementation(() => ({
      updateLastSampleEndTime: jest.fn(),
      addSample: jest.fn(),
      listSamples: jest.fn(),
      purgeSamplesTable: jest.fn()
  }))

  return { 
    UserLocationsDatabase,
    WifiMacAddressDatabase, 
    IntersectionSickDatabase,
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
    default: jest.fn(() => originalModule['com.hamagen']),
  };
});

jest.mock('../src/store.ts', () => {
  const dispatch = jest.fn(() => ({
    locale: 'he',
    notificationData: {
      sickMessage: {
        he: {
          title: 'כותרת',
          body: 'הודעה'
        }
      }
    }
  }));

  const store = jest.fn(() => ({ dispatch }));

  return {
    __esModule: true,
    namedExport: jest.fn(),
    default: store
  };
});
