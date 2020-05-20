import React from 'react';
import { CardStyleInterpolators, createStackNavigator } from '@react-navigation/stack';
import Welcome from './Welcome';
import Location from './Location';
import LocationIOS from './LocationIOS';
import BluetoothOnboarding from './BluetoothOnboarding';
import FilterDrivingOnBoarding from './FilterDrivingOnBoarding';
import LocationHistoryOnBoarding from './LocationHistoryOnBoarding';
import Notifications from './Notifications';
import AllSet from './AllSet';

const Stack = createStackNavigator();

const OnboardingRoutes = () => (
    <Stack.Navigator mode="modal" headerMode="none" initialRouteName="Welcome">
        <Stack.Screen name="Welcome" component={Welcome} />
        <Stack.Screen name="Location" component={Location} options={{ cardStyleInterpolator: CardStyleInterpolators.forScaleFromCenterAndroid }} />
        <Stack.Screen name="LocationIOS" component={LocationIOS} options={{ cardStyleInterpolator: CardStyleInterpolators.forScaleFromCenterAndroid }} />
        <Stack.Screen name="Bluetooth" component={BluetoothOnboarding} options={{ cardStyleInterpolator: CardStyleInterpolators.forScaleFromCenterAndroid }} initialParams={{showUsageLink: true}}/>
        <Stack.Screen name="FilterDrivingOnBoarding" component={FilterDrivingOnBoarding} options={{ cardStyleInterpolator: CardStyleInterpolators.forScaleFromCenterAndroid }} />
        <Stack.Screen name="LocationHistoryOnBoarding" component={LocationHistoryOnBoarding} options={{ cardStyleInterpolator: CardStyleInterpolators.forScaleFromCenterAndroid }} />
        <Stack.Screen name="Notifications" component={Notifications} options={{ cardStyleInterpolator: CardStyleInterpolators.forScaleFromCenterAndroid }} />
        <Stack.Screen name="AllSet" component={AllSet} options={{ cardStyleInterpolator: CardStyleInterpolators.forScaleFromCenterAndroid }} />
    </Stack.Navigator>
)

export default OnboardingRoutes