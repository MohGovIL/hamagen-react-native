import React, { FunctionComponent } from 'react';
import { View, StyleSheet } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { StackNavigationProp } from '@react-navigation/stack';
import DeviceInfo from 'react-native-device-info';
import { ActionButton, GeneralContainer, OnboardingHeader, Text, Icon, TouchableOpacity } from '../common';
import { Strings } from '../../locale/LocaleData';
import { IS_SMALL_SCREEN, MAIN_COLOR, USAGE_PRIVACY, IS_IOS } from '../../constants/Constants';
import { Store, LocaleReducer } from '../../types';
import { toggleWebview } from '../../actions/GeneralActions';
import BluetoothPermission from '../common/BluetoothPermission';
import BatteryPermission from '../common/BatteryPermission';

interface Props {
  navigation: StackNavigationProp<any, 'BatteryOptimization'>,
}

const BatteryOptimization: FunctionComponent<Props> = ({ navigation }) => {
  return (
    <GeneralContainer style={styles.container}>
      <OnboardingHeader />
      <BatteryPermission
        onEnd={() => {
          navigation.navigate('LocationHistoryOnBoarding');
        }}
      />
    </GeneralContainer>
  );
};


const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center'
  },
});

export default BatteryOptimization;
