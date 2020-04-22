import React from 'react';
import { createDrawerNavigator, } from '@react-navigation/drawer';
import { CardStyleInterpolators, createStackNavigator } from '@react-navigation/stack';
import { useSelector } from 'react-redux';
import ScanHome from '../Main/ScanHome';
import DrawerContent from './DrawerContent';
import ExposuresHistory from '../Main/ExposuresHistory/ExposuresHistory';
import ChangeLanguageScreen from '../ChangeLanguage/ChangeLanguageScreen';
import LocationHistory from '../Main/LocationHistory/LocationHistory';
import FilterDriving from '../Main/FilterDriving/FilterDriving';
import ShareLocations from '../ShareLocations/ShareLocations';
import { LocaleReducer, Store } from '../../types';

const DrawerStack = () => {
  const Stack = createStackNavigator();

  return (
    <Stack.Navigator mode="modal" headerMode="none" initialRouteName="ScanHome">
      <Stack.Screen name="ScanHome" component={ScanHome} options={{ cardStyleInterpolator: CardStyleInterpolators.forScaleFromCenterAndroid }} />
      <Stack.Screen name="ExposuresHistory" component={ExposuresHistory} options={{ cardStyleInterpolator: CardStyleInterpolators.forVerticalIOS }} />
      <Stack.Screen name="LocationHistory" component={LocationHistory} options={{ cardStyleInterpolator: CardStyleInterpolators.forScaleFromCenterAndroid }} />
      <Stack.Screen name="FilterDriving" component={FilterDriving} options={{ cardStyleInterpolator: CardStyleInterpolators.forScaleFromCenterAndroid }} />
      <Stack.Screen name="ShareLocations" component={ShareLocations} options={{ cardStyleInterpolator: CardStyleInterpolators.forVerticalIOS }} />
      <Stack.Screen name="ChangeLanguageScreen" component={ChangeLanguageScreen} options={{ cardStyleInterpolator: CardStyleInterpolators.forVerticalIOS }} />
    </Stack.Navigator>
  );
};

const Home = () => {
  const { isRTL } = useSelector<Store, LocaleReducer>(state => state.locale);

  const Drawer = createDrawerNavigator();

  return (
    <Drawer.Navigator
      screenOptions={{ gestureEnabled: false }}
      drawerContent={props => <DrawerContent {...props} />}
      drawerPosition={isRTL ? 'right' : 'left'}
      drawerStyle={{
        width: '100%'
      }}
    >
      <Drawer.Screen name="DrawerStack" component={DrawerStack} />
    </Drawer.Navigator>
  );
};

export default Home;
