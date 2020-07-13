import AsyncStorage from '@react-native-community/async-storage';
import { useFocusEffect, useRoute } from '@react-navigation/native';
import React, { FunctionComponent, useEffect, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
// @ts-ignore
import RNDisableBatteryOptimizationsAndroid from 'react-native-disable-battery-optimizations-android';
import { useDispatch, useSelector } from 'react-redux';
import { TouchableWithoutFeedback, Switch } from 'react-native-gesture-handler';
import BackgroundGeolocation, { DeviceSettingsRequest } from 'react-native-background-geolocation';
import { ActionButton, Icon, Text, TouchableOpacity, HeaderButton } from '../../common';
import { USER_DISABLED_BATTERY, ENABLE_BLE } from '../../../constants/ActionTypes';
import { IS_SMALL_SCREEN, MAIN_COLOR, SCREEN_WIDTH, USER_AGREED_TO_BATTERY, PADDING_TOP, PADDING_BOTTOM, BASIC_SHADOW_STYLES, WHITE, HIT_SLOP, USER_AGREE_TO_BLE } from '../../../constants/Constants';
import { LocaleReducer, Store, GeneralReducer } from '../../../types';
import { initBLETracing } from '../../../services/BLEService';

interface Props {

}

const BluetoothSettings: FunctionComponent<Props> = ({ navigation }) => {
  // const [userPressed,setUserPressed] = useState(false)
  const dispatch = useDispatch();
  const { isRTL, strings: {
    bluetoothSettings: { title, description, recommendation, BLEOn, BLEOff }
  } } = useSelector<Store, LocaleReducer>(state => state.locale);
  const { enableBle } = useSelector<Store, GeneralReducer>(state => state.general);


  return (
    <View style={[styles.container]}>
      <HeaderButton onPress={navigation.goBack} />
      <View style={{ alignItems: 'center', }}>

        <Icon
          width={106}
          customStyles={{ marginBottom: 20 }}
          source={require('../../../assets/onboarding/bluetoothBig.png')}
        />

        <Text style={styles.title} bold>{title}</Text>
        <Text style={styles.description}>{description}</Text>
        <Text style={{ fontSize: 16, color: 'rgb(98,98,98)', lineHeight: 24, }} bold>{recommendation}</Text>

      </View>

      <View
        style={[{
          ...BASIC_SHADOW_STYLES,
          paddingVertical: IS_SMALL_SCREEN ? 16 : 24,
          paddingHorizontal: IS_SMALL_SCREEN ? 8 : 16,
          borderRadius: 13,
          flexDirection: isRTL ? 'row-reverse' : 'row',
          justifyContent: 'space-between',
          alignItems: 'center'
        }]}
      >

        <Text style={{ flex: 1, color: 'rgb(98,98,98)', textAlign: isRTL ? 'right' : 'left' }} bold>{enableBle ? BLEOn : BLEOff}</Text>
        <Switch 
          value={Boolean(enableBle)} 
          onValueChange={async (payload: boolean) => {
            dispatch({ type: ENABLE_BLE, payload });
            await AsyncStorage.setItem(USER_AGREE_TO_BLE, payload.toString());
            await initBLETracing();
          }}
        />

      </View>

    </View>


  );
};
// 'rgb(195,219,110)' : 'rgb(255,130,130)'
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-evenly',
    alignContent: 'center',
    paddingHorizontal: IS_SMALL_SCREEN ? 30 : 40,
    backgroundColor: WHITE
  },
  title: {
    fontSize: 22,
    marginBottom: 25
  },
  description: {
    lineHeight: 24,
    marginBottom: 25,
    color: 'rgb(109,109,109)'
  },
  callToAction: {
    lineHeight: 22,
    color: '#4d4d4d'
  },
  dot: {
    width: 14,
    height: 14,
    borderRadius: 14,

  }
});

export default BluetoothSettings;
