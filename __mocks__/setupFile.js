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
  
  const containsObjectID = jest.fn();
  const addSickRecord = jest.fn();

  const IntersectionSickDatabase = jest.fn().mockImplementation(() => ({
    containsObjectID, addSickRecord 
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

jest.mock('react-native-firebase', () => {


  const firebase = {
    messaging: jest.fn(() => {
      return {
        hasPermission: jest.fn(() => Promise.resolve(true)),
        subscribeToTopic: jest.fn(),
        unsubscribeFromTopic: jest.fn(),
        requestPermission: jest.fn(() => Promise.resolve(true)),
        getToken: jest.fn(() => Promise.resolve('myMockToken'))
      };
    }),
    notifications: jest.fn(() => {
      return {
        onNotification: jest.fn(),
        onNotificationDisplayed: jest.fn()
      };
    })
  }

  firebase.notifications.Android = {
    Channel: jest.fn(() => ({
      setDescription: jest.fn(),
      setSound: jest.fn(),
      enableVibration: jest.fn(),
      setVibrationPattern: jest.fn()
    })),
    Importance: {
      Max: {}
    }
  };

  return firebase;
  
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
    default: jest.fn(() => originalModule['com.hamagen.dev']),
  };
});
