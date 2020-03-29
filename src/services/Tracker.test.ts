// import fetch from 'cross-fetch';
import { NativeModules } from 'react-native';
import config from '../config/config';
import * as tracker from './Tracker';
import * as db from '../database/Database';
import * as constants from '../constants/Constants';

jest.mock('./PushService', () => {
  const registerLocalNotification = jest.fn()
  return { registerLocalNotification }
})

const oneMinute = 60 * 1000;
const oneHour = 60 * oneMinute;
const {intersectMilliseconds} = config()
const largerThanIntersectMilliseconds = 1.1 * intersectMilliseconds;
const smallerThanIntersectMilliseconds = 0.9 * intersectMilliseconds;
const sickPeople = {
  geometry: {
    type: 'Point',
    coordinates: [34.8077312410001, 32.1154996280001],
  },
  properties: {
    OBJECTID: 1720,
    Name: 'חולה 15',
    Place: 'קלאוזנר 14, רמת אביב (קלפי ייעודית למבודדי בית)',
    Comments:
      'על מי ששעת הגעתו לקלפי זו היתה בין השעות 10:15-11:15 להאריך את הבידוד הביתי ל14 יום מיום הבחירות',
    POINT_X: 34.80773124,
    POINT_Y: 32.11549963,
    fromTime: 1583144100000,
    toTime: 1583147700000,
    sourceOID: 1,
    stayTimes: '10:15-11:15',
  },
};
const sickPeopleArray = [sickPeople];

const sickRecord = {
  properties: {
    fromTime: 10 * oneHour,
    toTime: 20 * oneHour,
  },
  geometry: {
    type: 'Point',
    coordinates: [34.61261540000004, 31.31095400000004],
  }
};

describe('Tracker', () => {
 
  // ====================================
  //  Check all TimeOverlapping Scenario
  // ====================================

  test('isTimeOverlapping()', async () => {
    //Check user time not intersects before sick time range
    expect(
      tracker.isTimeOverlapping(
        { startTime: oneHour, endTime: 2 * oneHour },
        sickRecord,
      ),
    ).toBe(false);

    //Check user no intersects same end time
    expect(
      tracker.isTimeOverlapping(
        { startTime: 8 * oneHour, endTime: 10 * oneHour },
        sickRecord,
      ),
    ).toBe(false);

    //Check user end time intersects sick range
    expect(
      tracker.isTimeOverlapping(
        { startTime: 8 * oneHour, endTime: 12 * oneHour },
        sickRecord,
      ),
    ).toBe(true);

    //Check sick user full time inside user time
    expect(
      tracker.isTimeOverlapping(
        { startTime: 9 * oneHour, endTime: 22 * oneHour },
        sickRecord,
      ),
    ).toBe(true);

    //Check user full time in sick range
    expect(
      tracker.isTimeOverlapping(
        { startTime: 11 * oneHour, endTime: 12 * oneHour },
        sickRecord,
      ),
    ).toBe(true);

    //Check user start time intersects with sick time
    expect(
      tracker.isTimeOverlapping(
        { startTime: 15 * oneHour, endTime: 22 * oneHour },
        sickRecord,
      ),
    ).toBe(true);

    //Check no intersects but same end time
    expect(
      tracker.isTimeOverlapping(
        { startTime: 20 * oneHour, endTime: 22 * oneHour },
        sickRecord,
      ),
    ).toBe(false);

    //Check user time not intersects after sick time
    expect(
      tracker.isTimeOverlapping(
        { startTime: 21 * oneHour, endTime: 26 * oneHour },
        sickRecord,
      ),
    ).toBe(false);



    // ================================================
    //  Check the milliseconds overlapping restriction
    // ================================================

    //Check smaller than intersect milliseconds
    expect(
      tracker.isTimeOverlapping(
        { startTime: 8 * oneHour, endTime: (10 * oneHour + smallerThanIntersectMilliseconds) },
        sickRecord,
      ),
    ).toBe(false);

    //Check larger than intersect milliseconds
    expect(
      tracker.isTimeOverlapping(
        { startTime: 9 * oneHour, endTime: (10 * oneHour + largerThanIntersectMilliseconds) },
        sickRecord,
      ),
    ).toBe(true);

    //Check larger than intersect milliseconds
    expect(
      tracker.isTimeOverlapping(
        { startTime: (18 * oneHour + smallerThanIntersectMilliseconds), endTime: 21 * oneHour },
        sickRecord,
      ),
    ).toBe(true);


  });

  test('unitTestGeography()', async () => {
    // South
    expect(
      tracker.isSpaceOverlapping({ long: 34.612383, lat: 31.307915 }, sickRecord),
    ).toBe(true);
    expect(
      tracker.isSpaceOverlapping({ long: 34.612645, lat: 31.305848 }, sickRecord),
    ).toBe(false);
    // West
    expect(
      tracker.isSpaceOverlapping({ long: 34.609032, lat: 31.311498 }, sickRecord),
    ).toBe(true);
    expect(
      tracker.isSpaceOverlapping({ long: 34.604462, lat: 31.311608 }, sickRecord),
    ).toBe(false);
    // North-East
    expect(
      tracker.isSpaceOverlapping({ long: 34.615315, lat: 31.312473 }, sickRecord),
    ).toBe(true);
    expect(
      tracker.isSpaceOverlapping({ long: 34.618952, lat: 31.314902 }, sickRecord),
    ).toBe(false);
  });

  test('unitTestIntersectingRecords()', async () => {
    fetch(config().dataUrl, { headers: { 'Content-Type': 'application/json;charset=utf-8' } })
      .then(response => response.json())
      .then(async (responseJson) => {
        const myData = [
          {
            startTime: 1583144150000,
            endTime: 1583147700000,
            accuracy: 5,
            long: 34.807731241000056,
            lat: 32.115499628000066,
          },
          {
            startTime: 1583346600000,
            endTime: 1583351500000,
            accuracy: 10,
            long: 35.535289000000034,
            lat: 32.78675100000004,
          },
          {
            startTime: 1583346600000,
            endTime: 1583351500000,
            accuracy: 10,
            long: 37.535289000000034,
            lat: 32.78675100000004,
          },
          {
            startTime: 1584391600000,
            endTime: 1584396500000,
            accuracy: 10,
            long: 35.535289000000034,
            lat: 32.78675100000004,
          },
        ];

        const intersectingRecords = tracker.getIntersectingSickRecords(
          myData,
          responseJson,
        );

        expect(intersectingRecords.length).toEqual(2);
      });
  });

  test('queryDB()', async () => {
    const userLocationDB = new db.UserLocationsDatabase();
    const rows = ['data1', 'data2', 'data3'];
    userLocationDB.listSamples.mockReturnValueOnce(Promise.resolve(rows));
    await expect(tracker.queryDB()).resolves.toEqual(rows);
  });

  test('onSickPeopleNotify()', async () => {
    const sickDB = new db.IntersectionSickDatabase();
    const rows: any = [];
    sickDB.addSickRecord.mockReturnValueOnce(Promise.resolve(rows));
    sickDB.containsObjectID.mockReturnValueOnce(Promise.resolve(rows));
    // check he
    await expect(tracker.onSickPeopleNotify(sickPeopleArray)).resolves.toEqual(undefined);
    // check unsupported language
    NativeModules.SettingsManager.settings.AppleLocale = 'gh';
    await expect(tracker.onSickPeopleNotify(sickPeopleArray)).resolves.toEqual(undefined);

    constants.IS_IOS = false;
    await expect(tracker.onSickPeopleNotify(sickPeopleArray)).resolves.toEqual(undefined);
  });

  test('checkSickPeople() - good', async () => {
    const userLocationDB = new db.UserLocationsDatabase();
    const sampleData = [
      {
        startTime: 1584468100000,
        endTime: 1584568739000,
        accuracy: 5,
        long: 34.901541,
        lat: 32.132502,
      },
      {
        startTime: 1583346600000,
        endTime: 1583351500000,
        accuracy: 10,
        long: 35.535289000000034,
        lat: 32.78675100000004,
      }
    ];

    const responseJSON = {
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          id: 1,
          geometry: {
            type: 'Point',
            coordinates: [
              34.901541,
              32.132502
            ]
          },
          properties: {
            OBJECTID: 1,
            Name: 'חולה 16',
            Place: 'ניקודה בקניון',
            Comments: 'בדיקה',
            POINT_X: 34.901541,
            POINT_Y: 32.132502,
            fromTime: 1584468000000,
            toTime: 1584568740000,
            sourceOID: 1,
            stayTimes: '18:00 - 10:00'
          }
        }
      ]
    };
    fetch.mockResponseOnce(JSON.stringify(responseJSON));
    userLocationDB.listSamples.mockReturnValueOnce(Promise.resolve(sampleData));
    await tracker.checkSickPeople();
  });

  test('checkSickPeople() - NoData', async () => {
    const userLocationDB = new db.UserLocationsDatabase();
    const responseJSON = {
      features: 'asd'
    };
    fetch.mockResponseOnce(JSON.stringify(responseJSON));
    userLocationDB.listSamples.mockReturnValueOnce(Promise.resolve([]));
    await tracker.checkSickPeople();
  });

  test('checkSickPeople() - fetch error', async () => {
    const userLocationDB = new db.UserLocationsDatabase();
    userLocationDB.listSamples.mockReturnValueOnce(Promise.resolve([]));
    await tracker.checkSickPeople();
  });

  test('startForegroundTimer()', async ()=>{
    await tracker.startForegroundTimer();
  })
});
