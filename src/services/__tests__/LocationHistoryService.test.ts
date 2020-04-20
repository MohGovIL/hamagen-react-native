import AsyncStorage from '@react-native-community/async-storage';
import moment, { valueOf, subtract, date, month, year, } from 'moment';
import { encode } from 'latlon-geohash';
import { kml } from '@tmcw/togeojson';
import { onError } from '../ErrorService';
import * as db from '../../database/Database';
import { sha256 } from '../sha256';
import { dispatch } from '../../store';
import { FIRST_POINT_TS, SHOULD_HIDE_LOCATION_HISTORY } from '../../constants/Constants';
import * as generalActions from '../../actions/GeneralActions';
import { insertToSampleDB, kmlToGeoJson, getLoadingHTML, getLastNrDaysKmlUrls } from '../LocationHistoryService';


const actionSpy = jest.spyOn(generalActions, 'checkIfHideLocationHistory');

beforeEach(() => {
  AsyncStorage.mockClear();
  moment.mockClear();
});


jest.mock('xmldom', () => ({
  DOMParser: jest.fn().mockImplementation(() => ({
    parseFromString: jest.fn()
  }))
}));

// const {subtract, date, month, year} = momentSubFn

describe('LocationHistoryService', () => {
  describe('getLoadingHTML', () => {
    test('Is valid HTML', () => {
      const { DOMParser } = jest.requireActual('xmldom');
      const loadedHTML = getLoadingHTML();
      // check if parsing the dom works
      expect(new DOMParser().parseFromString(loadedHTML)).toBeDefined();
    });
  });

  describe('getLastNrDaysKmlUrls', () => {
    test('make an array for 2 weeks', () => {
      subtract.mockImplementation(() => ({
        date,
        month,
        year,
      }));
      expect(getLastNrDaysKmlUrls()).toHaveLength(14);
      // length of 2 weeks
      expect(subtract).toBeCalledTimes(14);
    });
  });

  describe('kmlToGeoJson', () => {
    beforeEach(() => {
      kml.mockClear();
    });

    test('no text', () => {
      kml.mockReturnValue({ features: [] });
      expect(kmlToGeoJson()).toHaveLength(0);
      expect(kmlToGeoJson('')).toHaveLength(0);
    });

    test('filters results', () => {
      const features = [
        {
          geometry: {
            type: 'Point',

          },
          properties: {
            timespan: {
              begin: 1,
              end: 2
            },
            coordinates: [1, 1],
            Category: 'should ignore from test',

          }
        },
      ];
      kml.mockReturnValue({ features });
      expect(kmlToGeoJson('')).toHaveLength(0);
    });

    test('make proper sample obj', () => {
      const features = [
        {
          geometry: {
            type: 'Point',
            coordinates: [34.8077312410001, 32.1154996280001],
          },
          properties: {
            OBJECTID: 1720,
            Key_Field: 1720,
            Name: 'חולה 15',
            Place: 'קלאוזנר 14, רמת אביב (קלפי ייעודית למבודדי בית)',
            Comments:
                        'על מי ששעת הגעתו לקלפי זו היתה בין השעות 10:15-11:15 להאריך את הבידוד הביתי ל14 יום מיום הבחירות',
            POINT_X: 34.80773124,
            POINT_Y: 32.11549963,
            timespan: {
              begin: 1583144100000,
              end: 1583147700000
            },
            sourceOID: 1,
            stayTimes: '10:15-11:15',
          },
        }
      ];
      valueOf.mockReturnValueOnce(1).mockReturnValueOnce(2);
      kml.mockReturnValue({ features });
      encode.mockReturnValueOnce(1);

      expect(kmlToGeoJson('')).toEqual([{
        startTime: 1,
        endTime: 2,
        long: 34.8077312410001,
        lat: 32.1154996280001,
        geoHash: 1,
        accuracy: 0,
        wifiHash: ''
      }]);
    });
  });

  describe('insertToSampleDB', () => {
    beforeEach(() => {
      dispatch.mockClear();
      actionSpy.mockClear();
    });
    // we assume insertToSampleDB will be called with array > 0 so we will not check
    const sampleData = [
      {
        startTime: 1583346600000,
        endTime: 1583351500000,
        accuracy: 10,
        long: 35.535289000000034,
        lat: 32.78675100000004,
      },
      {
        startTime: 1584468100000,
        endTime: 1584568739000,
        accuracy: 5,
        long: 34.901541,
        lat: 32.132502,
      },

    ];

    test('two data point', async () => {
      expect(await insertToSampleDB(sampleData)).toBeUndefined();
      // sha was called with all the sample data
      expect(sha256).toHaveBeenCalledWith(JSON.stringify(sampleData[0]));
      expect(sha256).toHaveBeenCalledWith(JSON.stringify(sampleData[1]));

      expect(db.insertBulkSamples).toBeCalledTimes(1);
      expect(db.insertBulkSamples).toBeCalledWith(sampleData.reduce((curr, sample) => `${curr}(${sample.lat},${sample.long},${sample.accuracy},${sample.startTime},${sample.endTime},'${sample.geoHash}','','a'),`, '').slice(0, -1));

      expect(actionSpy).toBeCalledTimes(1);
    });

    test('with FIRST_POINT_TS', async () => {
      await AsyncStorage.setItem(FIRST_POINT_TS, (sampleData[0].startTime - 2000).toString());

      expect(await insertToSampleDB(sampleData)).toBeUndefined();

      expect(AsyncStorage.setItem).toBeCalledWith(SHOULD_HIDE_LOCATION_HISTORY, 'true');
      expect(actionSpy).toBeCalledTimes(1);
      expect(dispatch).toBeCalledTimes(1);
    });
  });
});
