import { NativeModules } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-community/async-storage';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { LOCALE_CHANGED } from '../../constants/ActionTypes';

import { initLocale, changeLocale } from '../LocaleActions';
import { onError } from '../../services/ErrorService';

const mockStore = configureMockStore([thunk]);

const MAthRandomSpy = jest.spyOn(Math, 'random').mockReturnValue(0.5);

beforeEach(() => {
  onError.mockClear();
  axios.mockClear();
  AsyncStorage.mockClear();
});

describe('Locale action', () => {
  describe('initLocale', () => {
    test('init call', async () => {
      // setup
      // AsyncStorage.setItem.mockResolvedValueOnce('he')
      const store = mockStore();
      const mockResponse = {
        data: {
          languages: 'he',
          notificationData: undefined,
          externalUrls: undefined,
          he: {}
        },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {},
      };

      axios.get.mockResolvedValueOnce(mockResponse);


      await store.dispatch(initLocale());


      // expect(store.getActions()).toBe({})
      expect(onError).toBeCalledTimes(0);
    });

    test('default to AppleLanguages', async () => {
      NativeModules.SettingsManager.settings.AppleLocale = undefined;
      const mockResponse = {
        data: {
          languages: 'he',
          notificationData: undefined,
          externalUrls: undefined,
          he: {}
        },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {},
      };

      axios.get.mockResolvedValueOnce(mockResponse);

      const store = mockStore();
      await store.dispatch(initLocale());
      expect(onError).toBeCalledTimes(0);
    });


    test('async storage rejects', async () => {
      AsyncStorage.setItem.mockRejectedValueOnce(new TypeError('storage error'));
      const mockResponse = {
        data: {
          languages: 'he',
          notificationData: undefined,
          externalUrls: undefined,
          he: {}
        },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {},
      };

      axios.get.mockResolvedValueOnce(mockResponse);

      const store = mockStore();
      await store.dispatch(initLocale());

      expect(onError).toBeCalledTimes(1);
    });

    test('locale data fetch fail', async () => {

    });
  });

  describe('changeLocale', () => {
    test('change from he to en', async () => {
      const store = mockStore();
      // locale is he
      await store.dispatch(changeLocale('en'));
      expect(store.getActions()).toEqual([{ type: LOCALE_CHANGED, payload: { locale: 'en' } }]);
    });


    test('async storage rejects', async () => {
      AsyncStorage.setItem.mockRejectedValueOnce(new TypeError('storage error'));
      const store = mockStore();
      // locale is he
      await store.dispatch(changeLocale('en'));
      expect(onError).toBeCalledTimes(1);
    });
  });
});
