import React, { useState, useMemo, useEffect } from 'react';
import { ImageBackground, StyleSheet, TouchableOpacity, View, Animated } from 'react-native';

import { DrawerNavigationProp, useIsDrawerOpen } from '@react-navigation/drawer';
import { useDispatch, useSelector } from 'react-redux';
import { Icon, Text } from '../common';
import { Store } from '../../types';
import {
  HIT_SLOP, PADDING_BOTTOM,
  PADDING_TOP,
  SCREEN_HEIGHT,
  SCREEN_WIDTH,
  VERSION_NAME,
} from '../../constants/Constants';
import SettingsDrawerContent from './SettingsDrawerContent';
import HomeDrawerContent from './HomeDrawerContent';


interface Props {
  navigation: DrawerNavigationProp<any, 'DrawerStack'>
}

const DrawerContent = ({ navigation }: Props) => {

  const { locale: { strings: { general: { versionNumber } }, isRTL } } = useSelector<Store, Store>(state => state);
  const [showSettings, setShowSettings] = useState(false);

  const isDrawerOpen = useIsDrawerOpen();

  useEffect(() => {
    if (!isDrawerOpen) {
      setShowSettings(false);
    }
  }, [isDrawerOpen]);



  return (
    <ImageBackground
      style={{ flex: 1, }}
      source={require('../../assets/main/menuBG.png')}
    >
      <TouchableOpacity
        style={[styles.close, { [isRTL ? 'left' : 'right']: 20 }]}
        hitSlop={HIT_SLOP}
        onPress={navigation.closeDrawer}
      >
        <Icon source={require('../../assets/main/menuClose.png')} width={12} height={18} />
      </TouchableOpacity>

      <View style={{ flex: 1, flexDirection: isRTL ? 'row-reverse' : 'row' }}>
        {showSettings ?
          (<SettingsDrawerContent
            navigation={navigation}
            goToMainDrawer={() => setShowSettings(false)}
          />) :
          (<HomeDrawerContent
            navigation={navigation}
            showSettings={() => setShowSettings(true)}
          />)

        }

      </View>

      <View style={[styles.footerContainer, { alignSelf: isRTL ? 'flex-end' : 'flex-start' }]}>
        <Text style={styles.versionText}>{`${versionNumber} ${VERSION_NAME}`}</Text>
      </View>
    </ImageBackground>
  );
};


const styles = StyleSheet.create({
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
