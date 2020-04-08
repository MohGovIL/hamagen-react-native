import {NativeModules} from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
import {startSampling, insertDB, purgeSamplesDB, updateDBAccordingToSampleVelocity} from '../SampleService';
import {
  FIRST_POINT_TS,
  IS_LAST_POINT_FROM_TIMELINE,
  LAST_POINT_START_TIME,
  HIGH_VELOCITY_POINTS
} from '../../constants/Constants';
// import WifiService from './WifiService'
import * as db from '../../database/Database'

jest.mock('../WifiService', () => ({
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
      AsyncStorage.clear()
      AsyncStorage.getItem.mockClear()
      AsyncStorage.setItem.mockClear()
    })

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

  describe('updateDBAccordingToSampleVelocity', () => {
      beforeEach(() => {
        AsyncStorage.clear()
        AsyncStorage.getItem.mockClear()
        AsyncStorage.setItem.mockClear()
      })

      const sample = {
        activity: {
          type: "type",
          confidence: 85
        },
        coords: {
          latitude: 123.345,
          longitude: 543.213,
          accuracy: 0.4,
          speed: 3
        },
        is_moving: true,
        timestamp: new Date().getTime()
      }

      test('with last point missing', async () => {
        // mock IS_LAST_POINT_FROM_TIMELINE not there
        AsyncStorage.getItem.mockResolvedValueOnce(false)
        await updateDBAccordingToSampleVelocity(sample)
        expect(AsyncStorage.setItem).toBeCalledTimes(1)
        expect(AsyncStorage.setItem).toHaveBeenCalledWith(IS_LAST_POINT_FROM_TIMELINE, "true")
        
      })

      test('with not velocity points', async () => {
        // lower speed
        sample.coords.speed = 2
        // mock IS_LAST_POINT_FROM_TIMELINE
        AsyncStorage.getItem.mockResolvedValueOnce(true).mockResolvedValueOnce(undefined)

        expect(updateDBAccordingToSampleVelocity(sample)).resolves.toBeTruthy()
        // console.log(await AsyncStorage.getAllKeys())
      })

      test('with last point from DB', async () => {
        // mock IS_LAST_POINT_FROM_TIMELINE
        AsyncStorage.getItem.mockResolvedValueOnce(true).mockResolvedValueOnce(undefined)
        db.getLastPointEntered.mockResolvedValueOnce({lat: 123.123, long: 321.321, accuracy: 0.7, endTime: 123456789})
        expect(await updateDBAccordingToSampleVelocity(sample)).toBeTruthy()
        expect(AsyncStorage.removeItem).toBeCalledWith(HIGH_VELOCITY_POINTS)
      })
  })  
});
