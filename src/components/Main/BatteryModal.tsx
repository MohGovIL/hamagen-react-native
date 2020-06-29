import React, { FunctionComponent, useEffect } from 'react';
import { View, StyleSheet, BackHandler } from 'react-native';
import { useDispatch } from 'react-redux';
import AsyncStorage from '@react-native-community/async-storage';
import { StackNavigationProp } from '@react-navigation/stack';
import { HeaderButton } from '../common';
import { PADDING_TOP, IS_SMALL_SCREEN, PADDING_BOTTOM, USER_AGREED_TO_BATTERY } from '../../constants/Constants';
import { USER_DISABLED_BATTERY } from '../../constants/ActionTypes';
import BatteryPermission from '../common/BatteryPermission';

interface Props {
  navigation: StackNavigationProp<any, 'BatteryModal'>
}

const BatteryModal: FunctionComponent<Props> = ({ navigation }) => {
  const dispatch = useDispatch();

  useEffect(() => {
    BackHandler.addEventListener('hardwareBackPress', handleExit);

    return () => {
      BackHandler.removeEventListener('hardwareBackPress', handleExit);
    };
  })

  const handleExit = async () => {
    dispatch({ type: USER_DISABLED_BATTERY, payload: false });
    AsyncStorage.setItem(USER_AGREED_TO_BATTERY, 'false');
    navigation.goBack();
    return true
  };

  return (
    <View style={styles.container}>
      <HeaderButton type="close" onPress={handleExit} />
      <BatteryPermission
        onEnd={() => {
          navigation.goBack();
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
    paddingTop: PADDING_TOP(IS_SMALL_SCREEN ? 40 : 92),
    paddingBottom: PADDING_BOTTOM(IS_SMALL_SCREEN ? 10 : 77)
  },
});

export default BatteryModal;
