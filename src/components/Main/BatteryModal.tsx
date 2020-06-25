import React, { FunctionComponent } from 'react';
import { View, StyleSheet } from 'react-native';
import { useDispatch } from 'react-redux';
import AsyncStorage from '@react-native-community/async-storage';
import { StackNavigationProp } from '@react-navigation/stack';
import { HeaderButton } from '../common';
import { PADDING_TOP, IS_SMALL_SCREEN, PADDING_BOTTOM, USER_AGREE_TO_BLE } from '../../constants/Constants';
import { ENABLE_BLE } from '../../constants/ActionTypes';
import { initBLETracing } from '../../services/BLEService';
import BatteryPermission from '../common/BatteryPermission';

interface Props {
  navigation: StackNavigationProp<any, 'BatteryModal'>
}

const BatteryModal: FunctionComponent<Props> = ({ navigation }) => {
  const dispatch = useDispatch();

  const handleExit = async () => {
    // dispatch({ type: ENABLE_BLE, payload: false });
    // await AsyncStorage.setItem(USER_AGREE_TO_BLE, 'false');
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <HeaderButton type="close" onPress={handleExit} />
      <BatteryPermission
        onEnd={() => {
          navigation.goBack();
          // user agreed so start service
          // initBLETracing();
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: PADDING_TOP(IS_SMALL_SCREEN ? 10 : 92),
    paddingBottom: PADDING_BOTTOM(IS_SMALL_SCREEN ? 10 : 77)
  },
});

export default BatteryModal;
