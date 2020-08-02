import React, { useEffect, useState } from 'react';
import { createDrawerNavigator, } from '@react-navigation/drawer';
import AsyncStorage from '@react-native-community/async-storage';
import { CardStyleInterpolators, createStackNavigator } from '@react-navigation/stack';
import { useSelector } from 'react-redux';
import { NavigationProp, RouteProp } from '@react-navigation/native';
import ScanHome from '../Main/ScanHome';
import DrawerContent from './DrawerContent';
import ExposuresHistory from '../Main/ExposuresHistory/ExposuresHistory';
import ExposuresHistoryEdit from '../Main/ExposuresHistory/ExposuresHistoryEdit';
import ExposureHistoryRelief from '../Main/ExposuresHistory/ExposureHistoryRelief';
import ExposureDetected from '../Main/ExposuresDetected';
import ExposureInstructions from '../Main/ExposureInstructions';
import ExposureRelief from '../Main/ExposureRelief';
import ChangeLanguageScreen from '../ChangeLanguage/ChangeLanguageScreen';
import LocationHistory from '../Main/LocationHistory/LocationHistory';
import FilterDriving from '../Main/FilterDriving/FilterDriving';
import BluetoothModal from '../Main/Modals/BluetoothModal';
import ShareLocations from '../ShareLocations/ShareLocations';
import MapModal from '../Main/Modals/MapModal';
import { INIT_ROUTE_NAME } from '../../constants/Constants';
import BatteryModal from '../Main/Modals/BatteryModal';
import BatterySettings from '../Main/Settings/BatterySettings';
import * as LocalizedStyles from '../../constants/LocalizedStyles';

import { LocaleReducer, ExposuresReducer, Store } from '../../types';
import BluetoothSettings from '../Main/Settings/BluetoothSettings';

const Stack = createStackNavigator();

const DEFAULT_SCREEN = 'ScanHome';

interface DrawerStackProps {
  navigation: NavigationProp<any, 'DrawerStack'>, 
  route: RouteProp<any, 'DrawerStack'>
}

const DrawerStack = ({ navigation, route }: DrawerStackProps) => {
  const { exposures } = useSelector<Store, ExposuresReducer>(state => state.exposures);
  const [initialRouteName, setInitialRouteName] = useState('');
  const [showBLEPermission] = useState(undefined);

  useEffect(() => {
    AsyncStorage.getItem(INIT_ROUTE_NAME)
      .then(initRouteString => setInitialRouteName(initRouteString ?? DEFAULT_SCREEN))
      .catch(() => setInitialRouteName(DEFAULT_SCREEN));
  }, []);

  useEffect(() => {
    if (initialRouteName !== '' && exposures?.length > 0) {
      if (route.state?.routes && !route.state.routes.some(({ name }) => name === 'ExposureDetected')) {
        navigation.navigate('ExposureDetected');
      }
    }
  }, [exposures, initialRouteName, route]);
  if (!initialRouteName) return null;


  return (
    <Stack.Navigator gestureEnabled={false} mode="modal" headerMode="none" initialRouteName={initialRouteName} screenOptions={() => ({ gestureEnabled: false })}>
      <Stack.Screen name="ScanHome" component={ScanHome} options={{ cardStyleInterpolator: CardStyleInterpolators.forScaleFromCenterAndroid }} initialParams={{ showBleInfo: showBLEPermission !== 'true' }} />
      <Stack.Screen name="ExposuresHistory" component={ExposuresHistory} options={{ cardStyleInterpolator: CardStyleInterpolators.forVerticalIOS }} />
      <Stack.Screen name="LocationHistory" component={LocationHistory} options={{ cardStyleInterpolator: CardStyleInterpolators.forVerticalIOS }} />
      <Stack.Screen name="FilterDriving" component={FilterDriving} options={{ cardStyleInterpolator: CardStyleInterpolators.forVerticalIOS }} />
      <Stack.Screen name="ShareLocations" component={ShareLocations} options={{ cardStyleInterpolator: CardStyleInterpolators.forVerticalIOS }} />
      <Stack.Screen name="ChangeLanguageScreen" component={ChangeLanguageScreen} options={{ cardStyleInterpolator: CardStyleInterpolators.forVerticalIOS }} />
      <Stack.Screen name="ExposureDetected" component={ExposureDetected} gestureEnabled={false} options={{ cardStyleInterpolator: CardStyleInterpolators.forVerticalIOS }} />
      <Stack.Screen name="ExposureInstructions" component={ExposureInstructions} gestureEnabled={false} options={{ cardStyleInterpolator: CardStyleInterpolators.forVerticalIOS }} initialParams={{ showEdit: false }} />
      <Stack.Screen name="ExposureRelief" component={ExposureRelief} options={{ cardStyleInterpolator: CardStyleInterpolators.forVerticalIOS }} />
      <Stack.Screen name="ExposuresHistoryEdit" component={ExposuresHistoryEdit} options={{ cardStyleInterpolator: CardStyleInterpolators.forVerticalIOS }} />
      <Stack.Screen name="ExposureHistoryRelief" component={ExposureHistoryRelief} options={{ cardStyleInterpolator: CardStyleInterpolators.forVerticalIOS }} />
      <Stack.Screen name="Bluetooth" component={BluetoothModal} options={{ cardStyleInterpolator: CardStyleInterpolators.forVerticalIOS }} />
      <Stack.Screen name="BluetoothSettings" component={BluetoothSettings} options={{ cardStyleInterpolator: CardStyleInterpolators.forVerticalIOS }} />
      <Stack.Screen name="Battery" component={BatteryModal} options={{ cardStyleInterpolator: CardStyleInterpolators.forRevealFromBottomAndroid }} />
      <Stack.Screen name="BatterySettings" component={BatterySettings} options={{ cardStyleInterpolator: CardStyleInterpolators.forVerticalIOS }} />
    </Stack.Navigator>
  );
};

const Drawer = createDrawerNavigator();

const Home = () => {
  const { isRTL } = useSelector<Store, LocaleReducer>(state => state.locale);

  return (
    <>
      <Drawer.Navigator
        drawerType="back"
        screenOptions={{ gestureEnabled: false }}
        drawerContent={props => <DrawerContent {...props} />}
        drawerPosition={LocalizedStyles.side(isRTL)}
        drawerStyle={{
          width: '100%'
        }}
      >
        <Drawer.Screen name="DrawerStack" component={DrawerStack} />
      </Drawer.Navigator>

      <MapModal />
    </>
  );
};

export default Home;
