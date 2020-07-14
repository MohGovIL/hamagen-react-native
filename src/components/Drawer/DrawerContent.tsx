import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { ImageBackground, StyleSheet, TouchableOpacity, View, Animated } from 'react-native';

import { DrawerNavigationProp, useIsDrawerOpen } from '@react-navigation/drawer';
import { useDispatch, useSelector } from 'react-redux';
import AsyncStorage from '@react-native-community/async-storage';
import BackgroundGeolocation from 'react-native-background-geolocation';
import { useFocusEffect } from '@react-navigation/native';
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
  USER_AGREED_TO_BATTERY,
  IS_IOS,
  IS_SMALL_SCREEN,
} from '../../constants/Constants';
import { toggleWebview } from '../../actions/GeneralActions';
import { USER_DISABLED_BATTERY } from '../../constants/ActionTypes';
import SettingsDrawerContent from './SettingsDrawerContent';
import HomeDrawerContent from './HomeDrawerContent';


interface Props {
  navigation: DrawerNavigationProp<any, 'DrawerStack'>
}

const DrawerContent = ({ navigation }: Props) => {
  const dispatch = useDispatch();

  const { locale: { strings: { general: { versionNumber, additionalInfo }, exposuresHistory, languages, menu: { battery, bluetooth } }, isRTL }, general: { enableBle, batteryDisabled } } = useSelector<Store, Store>(state => state);
  const translateX = useMemo(() => new Animated.Value(0), [])
  const [showSettings, setShowSettings] = useState(false)
  const isDrawerOpen = useIsDrawerOpen();
  useEffect(() => {
    if(!isDrawerOpen) {
      setShowSettings(false)
    }
  }, [isDrawerOpen]);

  useEffect(() => {
    Animated.timing(translateX, {
      toValue: showSettings ? isRTL ? SCREEN_WIDTH : -SCREEN_WIDTH : 0,
      duration: 300,
      useNativeDriver: true
    }).start()
  }, [showSettings])

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

      <View style={{ flex: 1, flexDirection: isRTL ?  'row-reverse' : 'row' }}>
        <Animated.View  style={{ transform: [{ translateX }]}}>
          <HomeDrawerContent navigation={navigation} showSettings={() => setShowSettings(true)}/>
        </Animated.View>
        <Animated.View style={{ transform: [{ translateX }]}}>
        <SettingsDrawerContent navigation={navigation} goToMainDrawer={() => setShowSettings(false)}/>
        </Animated.View>
      </View>

      <View style={[styles.footerContainer, { alignSelf: isRTL ? 'flex-end' : 'flex-start' }]}>
        <Text style={styles.versionText}>{`${versionNumber} ${VERSION_NAME}`}</Text>
      </View>
    </ImageBackground>
  )
};


const styles = StyleSheet.create({
  container: {
    flex: 1,
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
