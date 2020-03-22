import AsyncStorage from '@react-native-community/async-storage';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import * as actionTypes from '../constants/ActionTypes';
import * as constants from '../constants/Constants';
import * as ExposuresActions from './ExposuresActions';
import { Exposure } from '../types';

const mockStore = configureMockStore([thunk]);


describe('ExposuresActions', () => {
  test('setExposures()', async () => {
    const sickRecord: Exposure = {
      properties: {
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
    return store.dispatch(ExposuresActions.setExposures([sickRecord])).then(() => {
      const actions = store.getActions();
      expect(actions).toEqual(expectedActions);
    });
  });

  test('setValidExposure()', async () => {
    const sickExposure: Exposure = {
      properties: {
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
    store.dispatch(ExposuresActions.setValidExposure(sickExposure)).then(() => {
      const actions = store.getActions();
      expect(actions).toEqual(expectedActions);
    });
  });

  test('removeValidExposure()', async () => {
    const expectedActions = [
      { type: actionTypes.REMOVE_VALID_EXPOSURE },
    ];
    const store = mockStore({});
    return store.dispatch(ExposuresActions.removeValidExposure()).then(() => {
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
    store.dispatch(ExposuresActions.dismissExposure(1)).then(() => {
      const actions = store.getActions();
      expect(actions).toEqual(expectedActions);
    });
    await AsyncStorage.removeItem(constants.DISMISSED_EXPOSURES);
    store.dispatch(ExposuresActions.dismissExposure(1)).then(() => {
      const actions = store.getActions();
      expect(actions).toEqual(expectedActions);
    });
  });
});
