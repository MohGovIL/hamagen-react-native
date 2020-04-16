import { onError } from '../ErrorService';
import AsyncStorage from '@react-native-community/async-storage'
import * as db from '../../database/Database';
import {sha256} from '../sha256'
import {dispatch} from '../../store'
import { FIRST_POINT_TS } from '../../constants/Constants';
import * as generalActions from '../../actions/GeneralActions'
import {insertToSampleDB,getLoadingHTML} from '../LocationHistoryService'

const actionSpy = jest.spyOn(generalActions, 'checkIfHideLocationHistory')

describe('LocationHistoryService', () => {

    xdescribe('getLoadingHTML', () => {
        test('Is valid HTML', () => {
            const loadedHTML = getLoadingHTML()
            
        })
    })

    xdescribe('getLastNrDaysKmlUrls', () => {

    })

    xdescribe('kmlToGeoJson', () => {

    })

    describe('insertToSampleDB', () => {
        beforeEach(() => {
            dispatch.mockClear()
            actionSpy.mockClear()
        })
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
            
        ]

        test('two data point',async () => {
            
            expect(await insertToSampleDB(sampleData)).toBeUndefined()
            // sha was called with all the sample data
            expect(sha256).toHaveBeenCalledWith(JSON.stringify(sampleData[0]))
            expect(sha256).toHaveBeenCalledWith(JSON.stringify(sampleData[1]))

            expect(db.insertBulkSamples).toBeCalledTimes(1)
            expect(db.insertBulkSamples).toBeCalledWith(sampleData.reduce((curr, sample) => `${curr}(${sample.lat},${sample.long},${sample.accuracy},${sample.startTime},${sample.endTime},'${sample.geoHash}','','a'),`,'').slice(0, -1))

            expect(actionSpy).toBeCalledTimes(1)
            console.log(dispatch.mock.calls);
            
        } )

        test.only('with FIRST_POINT_TS', async () => {
            await AsyncStorage.setItem(FIRST_POINT_TS, (sampleData[0].startTime - 2000).toString())

            expect(await insertToSampleDB(sampleData)).toBeUndefined()

            expect(actionSpy).toBeCalledTimes(1)
            
        })

    })
})