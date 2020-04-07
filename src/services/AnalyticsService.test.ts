import {logEvent} from './AnalyticsService'
import firebase from 'react-native-firebase'

describe('Analytics Service', () => {
    test('log event', () => {
        logEvent('test log event', {test: true})
        expect(firebase.analytics().logEvent).toBeCalledTimes(1)
        expect(firebase.analytics().logEvent).toBeCalledWith('test log event', {test: true})
    })
})