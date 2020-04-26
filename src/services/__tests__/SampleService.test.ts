import AsyncStorage from '@react-native-community/async-storage';
import { startSampling, insertDB, purgeSamplesDB, updateDBAccordingToSampleVelocity } from '../SampleService';
import { onError } from '../ErrorService';
import * as db from '../../database/Database';
import { IS_LAST_POINT_FROM_TIMELINE, HIGH_VELOCITY_POINTS } from '../../constants/Constants';
import { startLocationTracking } from '../LocationService';


jest.mock('../WifiService', () => ({
  getWifiList: jest.fn().mockResolvedValue(['ssdid']),
}));

jest.mock('../LocationService', () => ({
  startLocationTracking: jest.fn()
}));

beforeEach(() => {
  onError.mockClear();
  db.mockClear();
  AsyncStorage.mockClear();
  startLocationTracking.mockClear();
});

afterEach(() => {
  expect(onError).toBeCalledTimes(0);
});

describe('Sample Service', () => {
  describe('startSampling', () => {
    test('check resolves', async () => {
      startLocationTracking.mockResolvedValueOnce();
      await startSampling('en', { androidNotification: {} });
      expect(startLocationTracking).toBeCalledTimes(1);
    });

    test('check resolves for unknown language', async () => {
      startLocationTracking.mockResolvedValueOnce();
      expect(startSampling('ge', { androidNotification: {} })).resolves.toBeTruthy();
      expect(startLocationTracking).toBeCalledTimes(1);
    });

    test('startLocationTracking reject', async () => {
      startLocationTracking.mockRejectedValueOnce();
      expect(startSampling('en', { androidNotification: {} })).rejects.toBeTruthy();
      expect(startLocationTracking).toBeCalledTimes(1);
    });
  });

  describe('insertDB', () => {
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
    });

    test('check storage not empty', async () => {
      // mock async storage has value for FIRST_POINT_TS
      AsyncStorage.getItem.mockResolvedValueOnce(true).mockResolvedValueOnce(false);

      expect(await insertDB(DBSample)).toBeTruthy();
    });
  });

  describe('purgeSamplesDB', () => {
    test('check purge DB returning resolved true', async () => {
      new db.UserLocationsDatabase().purgeSamplesTable.mockResolvedValueOnce(true);
      expect(purgeSamplesDB()).resolves.toBeUndefined();
    });

    test('check purge DB returning resolved true', async () => {
      new db.UserLocationsDatabase().purgeSamplesTable.mockRejectedValueOnce(new Error('Data base error'));


      expect(purgeSamplesDB()).rejects.toBeUndefined();
    });
  });

  describe('updateDBAccordingToSampleVelocity', () => {
    const sample = {
      activity: {
        type: 'type',
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
    };

    test('with last point missing', async () => {
      // mock IS_LAST_POINT_FROM_TIMELINE not there
      AsyncStorage.getItem.mockResolvedValueOnce(false);
      expect(await updateDBAccordingToSampleVelocity(sample)).toBeFalsy();
      // check the storage is set with correct args
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(IS_LAST_POINT_FROM_TIMELINE, 'true');
      expect(AsyncStorage.setItem).toBeCalledTimes(1);
      // check the db is set with correct args
      expect(db.updateLastSampleEndTime).toHaveBeenCalledWith(sample.timestamp);
      expect(db.updateLastSampleEndTime).toHaveBeenCalledTimes(1);
    });

    test('without velocity points', async () => {
      // lower speed
      sample.coords.speed = 2;
      // mock IS_LAST_POINT_FROM_TIMELINE
      await AsyncStorage.setItem(IS_LAST_POINT_FROM_TIMELINE, 'true');
      // return insertDB
      await updateDBAccordingToSampleVelocity(sample);
    });

    test('with one point from DB', async () => {
      sample.coords.speed = 2;
      // mock IS_LAST_POINT_FROM_TIMELINE
      await AsyncStorage.setItem(IS_LAST_POINT_FROM_TIMELINE, 'true');

      db.getLastPointEntered.mockResolvedValueOnce({ lat: 123.123, long: 321.321, accuracy: 0.7, endTime: new Date().getTime() });
      await updateDBAccordingToSampleVelocity(sample);
      expect(AsyncStorage.removeItem).toBeCalledWith(HIGH_VELOCITY_POINTS);
    });

    test('with multiple points from db', async () => {
      sample.is_moving = false;
      const highVelocityPoints = [{
        coords: {
          latitude: 123.123,
          longitude: 321.321,
          accuracy: 0.95
        },
        timestamp: 1586708482332
      },
      {
        coords: {
          latitude: 123.123,
          longitude: 321.321,
          accuracy: 0.95
        },
        timestamp: 1586708482332 - 20000
      }];

      await AsyncStorage.setItem(IS_LAST_POINT_FROM_TIMELINE, 'false');
      await AsyncStorage.setItem(HIGH_VELOCITY_POINTS, JSON.stringify(highVelocityPoints));
      AsyncStorage.setItem.mockClear();

      await updateDBAccordingToSampleVelocity(sample);
      expect(AsyncStorage.setItem).toBeCalledWith(HIGH_VELOCITY_POINTS, JSON.stringify([...highVelocityPoints, sample]));
    });
  });
});
