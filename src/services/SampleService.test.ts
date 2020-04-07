import {NativeModules} from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
import {startSampling, insertDB, purgeSamplesDB} from './SampleService';
import {
  FIRST_POINT_TS,
  IS_LAST_POINT_FROM_TIMELINE,
  LAST_POINT_START_TIME,
} from '../constants/Constants';
// import WifiService from './WifiService'
import * as db from '../database/Database'

jest.mock('./WifiService', () => ({
  getWifiList: jest.fn().mockResolvedValue(['ssdid']),
}));

describe('Sample Service', () => {
  describe('startSampling', () => {
    test('check resolves', async () => {
      expect(startSampling('en')).resolves.toBeTruthy();
    });

    test('check resolves for unknown language', async () => {
      expect(startSampling('ge')).resolves.toBeTruthy();
    });
  });

  describe('insertDB', () => {
    beforeEach(() => {
      AsyncStorage.clear();
    });
    const DBSample = {
        coords: {
          latitude: 31.307915,
          longitude: 34.612383,
          accuracy: 'high',
        },
        timestamp: new Date().getTime(),
        
      };
    test('check empty storage', async () => {
      // mock async storage has no value for FIRST_POINT_TS
      AsyncStorage.getItem.mockResolvedValueOnce(undefined);

      expect(await insertDB(DBSample)).toBeTruthy();
      expect(AsyncStorage.setItem).toBeCalledTimes(2);

    })

    test('check storage not empty', async () => {
        // mock async storage has value for FIRST_POINT_TS
        AsyncStorage.getItem.mockResolvedValueOnce(true).mockResolvedValueOnce(false);

        expect(await insertDB(DBSample)).toBeTruthy();
    })
  });

  describe('purgeSamplesDB', () => {
      beforeEach(() => {
        //   db.mockClear()
      })
    test('check purge DB returning resolved true', async () => {
        new db.UserLocationsDatabase().purgeSamplesTable.mockResolvedValueOnce(true)
        expect(purgeSamplesDB()).resolves.toBeUndefined()
    });

    test('check purge DB returning resolved true', async () => {
        new db.UserLocationsDatabase().purgeSamplesTable.mockRejectedValueOnce(new Error('Data base error'))
        
        
        expect(purgeSamplesDB()).rejects.toBeUndefined()
        // console.log(purgeSamplesTable.mock)
      });
  });
});
