import AsyncStorage from '@react-native-community/async-storage';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import * as actionTypes from '../../constants/ActionTypes';
import * as constants from '../../constants/Constants';
import { setExposures, setValidExposure, dismissExposure, removeValidExposure } from '../ExposuresActions';
import { Exposure } from '../../types';

const mockStore = configureMockStore([thunk]);

describe('ExposuresActions', () => {
  test('setExposures()', async () => {
    const sickRecord: Exposure = {
      properties: {
        OBJECTID: 2,
        Key_Field: 2,
        Name: 'name',
        Place: 'place',
        fromTime_utc: 10 * 60 * 60 * 1000,
        toTime_utc: 20 * 60 * 60 * 1000,
        fromTime: 10 * 60 * 60 * 1000,
        toTime: 20 * 60 * 60 * 1000,
      },
      geometry: {
        type: 'Point',
        coordinates: [34.61261540000004, 31.31095400000004],
      }, // Ofakim
    };
    const exposures: Exposure[] = [
      {
        properties: {
          OBJECTID: 2,
          Key_Field: 2,
          Name: 'name',
          Place: 'place',
          fromTime_utc: 10 * 60 * 60 * 1000,
          toTime_utc: 20 * 60 * 60 * 1000,
          fromTime: 10 * 60 * 60 * 1000,
          toTime: 20 * 60 * 60 * 1000,
        },
        geometry: {
          type: 'Point',
          coordinates: [34.61261540000004, 31.31095400000004],
        }, // Ofakim
      }
    ];
    const expectedActions = [
      { type: actionTypes.UPDATE_EXPOSURES, payload: { exposures } },
      { type: actionTypes.UPDATE_PAST_EXPOSURES, payload: { pastExposures: exposures } }
    ];
    await AsyncStorage.setItem(constants.DISMISSED_EXPOSURES, '[1]');
    const store = mockStore({});
    return store.dispatch(setExposures([sickRecord])).then(() => {
      const actions = store.getActions();
      expect(actions).toEqual(expectedActions);
    });
  });

  test('setValidExposure()', async () => {
    const sickExposure: Exposure = {
      properties: {
        OBJECTID: 1,
        Key_Field: 1,
        Name: 'name',
        Place: 'place',
        fromTime_utc: 10 * 60 * 60 * 1000,
        toTime_utc: 20 * 60 * 60 * 1000,
        fromTime: 10 * 60 * 60 * 1000,
        toTime: 20 * 60 * 60 * 1000,
      },
      geometry: {
        type: 'Point',
        coordinates: [34.61261540000004, 31.31095400000004],
      }
    };
    const expectedActions = [
      { type: actionTypes.SET_VALID_EXPOSURE, payload: { validExposure: sickExposure } },
    ];
    const store = mockStore({});
    store.dispatch(setValidExposure(sickExposure)).then(() => {
      const actions = store.getActions();
      expect(actions).toEqual(expectedActions);
    });
  });

  test('removeValidExposure()', async () => {
    const expectedActions = [
      { type: actionTypes.REMOVE_VALID_EXPOSURE },
    ];
    const store = mockStore({});
    return store.dispatch(removeValidExposure()).then(() => {
      const actions = store.getActions();
      expect(actions).toEqual(expectedActions);
    });
  });

  test('dismissExposure()', async () => {
    const expectedActions = [
      { type: actionTypes.DISMISS_EXPOSURE, payload: { exposureId: 1 } },
    ];
    await AsyncStorage.setItem(constants.DISMISSED_EXPOSURES, '[1]');
    const store = mockStore({});
    store.dispatch(dismissExposure(1)).then(() => {
      const actions = store.getActions();
      expect(actions).toEqual(expectedActions);
    });
    await AsyncStorage.removeItem(constants.DISMISSED_EXPOSURES);
    store.dispatch(dismissExposure(1)).then(() => {
      const actions = store.getActions();
      expect(actions).toEqual(expectedActions);
    });
  });
});
