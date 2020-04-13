import AsyncStorage from '@react-native-community/async-storage';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import * as actionTypes from '../../constants/ActionTypes';
import * as constants from '../../constants/Constants';

import {initLocale, changeLocale} from '../LocaleActions'
import { onError } from '../../services/ErrorService';

const mockStore = configureMockStore([thunk]);

describe('Locale action', () => {
    describe('initLocale', () => {
        test('call', async () => {
            const store = mockStore()
            await store.dispatch(initLocale())

            expect(onError).toBeCalledTimes(0)
        })
        test('async storage rejects', async () => {
            AsyncStorage.setItem.mockRejectedValueOnce(new TypeError('storage error'))
            const store = mockStore()
            await store.dispatch(initLocale())
            console.log(store.getActions());
            
            expect(onError).toBeCalledTimes(1)
        })
    })

    describe('changeLocale', () => {
        test('change from he to en', async () => {
            
            const store = mockStore()
            // locale is he
            await store.dispatch(changeLocale('en'))
            expect(store.getActions()).toEqual([{ type: 'LOCALE_CHANGED', payload: { locale: 'en' } }])
            
        })
    })
})