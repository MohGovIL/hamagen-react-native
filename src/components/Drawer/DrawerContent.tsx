import React, { useState, useCallback } from 'react';
import { ImageBackground, StyleSheet, TouchableOpacity, View } from 'react-native';
import { DrawerNavigationProp } from '@react-navigation/drawer';
import { useDispatch, useSelector } from 'react-redux';
import DrawerItem from './DrawerItem';
import { Icon, Text } from '../common';
import { Store } from '../../types';
import {
  HIT_SLOP, PADDING_BOTTOM,
  PADDING_TOP,
  SCREEN_HEIGHT,
  SCREEN_WIDTH,
  USAGE_PRIVACY,
  VERSION_NAME,
  USER_AGREE_TO_BLE,
  USER_AGREED_TO_BATTERY,
} from '../../constants/Constants';
import { toggleWebview } from '../../actions/GeneralActions';
import { Switch } from 'react-native-gesture-handler';
import { initBLETracing, requestToDisableBatteryOptimization } from '../../services/BLEService';
import AsyncStorage from '@react-native-community/async-storage';
import { ENABLE_BLE, USER_DISABLED_BATTERY } from '../../constants/ActionTypes';
import BackgroundGeolocation, { DeviceSettingsRequest } from 'react-native-background-geolocation';
import { useFocusEffect } from '@react-navigation/native';

interface Props {
  navigation: DrawerNavigationProp<any, 'DrawerStack'>
}

const DrawerContent = ({ navigation }: Props) => {
  const dispatch = useDispatch();

  const { locale: { strings: { general: { versionNumber, additionalInfo }, exposuresHistory, languages }, isRTL }, general: { enableBle, batteryDisabled } } = useSelector<Store, Store>(state => state);
  const [sample, setSample] = useState(false)

  useFocusEffect(
    useCallback(() => {
      if (sample) {
        BackgroundGeolocation.deviceSettings.isIgnoringBatteryOptimizations().then((isIgnoring: Boolean) => {
          if (isIgnoring !== batteryDisabled) {
            AsyncStorage.setItem(USER_AGREED_TO_BATTERY, (isIgnoring).toString());
            dispatch({ type: USER_DISABLED_BATTERY, payload: isIgnoring });
          }
        })

        setSample(false)
      }
    }, [sample])
  )

  return (
    <ImageBackground
      style={styles.container}
      source={require('../../assets/main/menuBG.png')}
    >
      <TouchableOpacity
        style={[styles.close, { [isRTL ? 'left' : 'right']: 20 }]}
        hitSlop={HIT_SLOP}
        onPress={navigation.closeDrawer}
      >
        <Icon source={require('../../assets/main/menuClose.png')} width={12} height={18} />
      </TouchableOpacity>

      <View style={styles.buttonsContainer}>
        <DrawerItem
          isRTL={isRTL}
          icon={require('../../assets/main/history.png')}
          label={exposuresHistory.title}
          onPress={() => {
            navigation.navigate('ExposuresHistory');
            // navigation.closeDrawer();
          }}
        />

        <DrawerItem
          isRTL={isRTL}
          icon={require('../../assets/main/lang.png')}
          label={languages.title}
          onPress={() => {
            navigation.navigate('ChangeLanguageScreen');
            // navigation.closeDrawer();
          }}
        />

        <DrawerItem
          isRTL={isRTL}
          label={additionalInfo}
          icon={require('../../assets/main/policy.png')}
          onPress={() => {
            dispatch(toggleWebview(true, USAGE_PRIVACY));
            navigation.closeDrawer();
          }}
        />

        <View style={[styles.item, { flexDirection: isRTL ? 'row-reverse' : 'row' }]} >
          <View style={{flexDirection: isRTL ? 'row-reverse' : 'row' , alignItems: 'center'}}>
            <Icon source={require('../../assets/onboarding/bluetoothBig.png')} width={18} />
            <Text style={styles.label}>כבה בלוטות׳</Text>
          </View>
          <Switch
            value={Boolean(enableBle)}
            onValueChange={async (payload: boolean) => {
              dispatch({ type: ENABLE_BLE, payload });
              await AsyncStorage.setItem(USER_AGREE_TO_BLE, payload.toString());
              await initBLETracing()
            }}
          />
        </View>

        <DrawerItem
          isRTL={isRTL}
          label='לפתיחת הגדרות מיטוב סוללה'
          icon={require('../../assets/onboarding/batteryBig.png')}
          onPress={async () => {
            const request: DeviceSettingsRequest = await BackgroundGeolocation.deviceSettings.showIgnoreBatteryOptimizations()
            BackgroundGeolocation.deviceSettings.show(request);
          }}
        />
      </View>

      <View style={[styles.footerContainer, { alignSelf: isRTL ? 'flex-end' : 'flex-start' }]}>
        <Text style={styles.versionText}>{`${versionNumber} ${VERSION_NAME}`}</Text>
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT
  },
  close: {
    position: 'absolute',
    top: PADDING_TOP(20),
    zIndex: 1000
  },
  buttonsContainer: {
    flex: 1,
    paddingTop: PADDING_TOP(SCREEN_HEIGHT * 0.15)
  },
  footerContainer: {
    paddingTop: 20,
    paddingBottom: PADDING_BOTTOM(20)
  },
  versionText: {
    fontSize: 12,
    paddingHorizontal: 25
  },
  item: {
    justifyContent: 'space-between',
    alignItems: 'center',

    paddingHorizontal: 25,
    paddingVertical: 24,

    borderBottomColor: 'white',
    borderBottomWidth: 1.5,
  },
  label: {
    fontSize: 18,
    paddingHorizontal: 19
  }
});

export default DrawerContent;
