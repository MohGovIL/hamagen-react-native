import AsyncStorage from '@react-native-community/async-storage';
import { NavigationProp } from '@react-navigation/native';
import React, { useEffect } from 'react';
import { AppState, Linking, StyleSheet, View } from 'react-native';
import { check, PERMISSIONS, PermissionStatus, request, RESULTS } from 'react-native-permissions';
import { useDispatch, useSelector } from 'react-redux';
import { ENABLE_BLE } from '../../../constants/ActionTypes';
import { IS_SMALL_SCREEN, PADDING_BOTTOM, PADDING_TOP, SCREEN_WIDTH, USER_AGREE_TO_BLE, WHITE } from '../../../constants/Constants';
import { LocaleReducer, Store } from '../../../types';
import { ActionButton, HeaderButton, Icon, Text } from '../../common';

interface Props {
    navigation: NavigationProp<any, 'BluetoothDenied'>
}

const BluetoothDeniedModal = ({ navigation }: Props) => {
  const dispatch = useDispatch();
  const { strings: { BluetoothDenied: { title, description, recommendation, buttonText } } } = useSelector<Store, LocaleReducer>(state => state.locale);

  useEffect(() => {
    AppState.addEventListener('change', onAppStateChange);
    return () => { AppState.removeEventListener('change', onAppStateChange); };
  });

  const onAppStateChange = async () => {
    const BTCheckStatus: PermissionStatus = await check(PERMISSIONS.IOS.BLUETOOTH_PERIPHERAL);
    switch (BTCheckStatus) {
      case RESULTS.UNAVAILABLE: 
      case RESULTS.BLOCKED: {
        dispatch({ type: ENABLE_BLE, payload: 'blocked' });
        break;
      }
      case RESULTS.GRANTED: {
        dispatch({ type: ENABLE_BLE, payload: 'true' });
        await AsyncStorage.setItem(USER_AGREE_TO_BLE, 'true');
        break;
      }
      case RESULTS.DENIED: {
        const BTRequestStatus: PermissionStatus = await request(PERMISSIONS.IOS.BLUETOOTH_PERIPHERAL);
        switch (BTRequestStatus) {
          case RESULTS.DENIED: {
            dispatch({ type: ENABLE_BLE, payload: null});
            await AsyncStorage.removeItem(USER_AGREE_TO_BLE);
            break;
          }
          case RESULTS.BLOCKED: {
            dispatch({ type: ENABLE_BLE, payload: RESULTS.BLOCKED });
            await AsyncStorage.removeItem(USER_AGREE_TO_BLE);
            break;
          }
          case RESULTS.GRANTED: {
            dispatch({ type: ENABLE_BLE, payload: 'true' });
            await AsyncStorage.setItem(USER_AGREE_TO_BLE, 'true');
            break;
          }
        }
      }
    }
    navigation.navigate('ScanHome');
  };

  return (
    <View style={styles.container}>
      <HeaderButton type="close" onPress={navigation.goBack} />

      <Text style={styles.title} bold>{title}</Text>
      <Text style={styles.description}>{description}</Text>
      <Text style={styles.recommendation} bold>{recommendation}</Text>
      <Icon source={require('../../../assets/main/bluetoothDeniedInstruction.png')} width={SCREEN_WIDTH - 150} />

      <ActionButton
        text={buttonText}
        onPress={() => {
          Linking.openURL('app-settings:');
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-evenly',
    alignItems: 'center',
    paddingTop: PADDING_TOP(IS_SMALL_SCREEN ? 55.5 : 101),
    paddingBottom: PADDING_BOTTOM(IS_SMALL_SCREEN ? 35 : 77),
    paddingHorizontal: IS_SMALL_SCREEN ? 30 : 40,
    backgroundColor: WHITE
  },
  title: {
    fontSize: 22,
    marginBottom: 25
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
  },
  recommendation: {
    lineHeight: 16,
  },
  dot: {
    width: 14,
    height: 14,
    borderRadius: 14,

  }
});

export default BluetoothDeniedModal;
