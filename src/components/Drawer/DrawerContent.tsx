import React from 'react';
import { ImageBackground, StyleSheet, TouchableOpacity, View } from 'react-native';
import { DrawerNavigationProp } from '@react-navigation/drawer';
import { useDispatch, useSelector } from 'react-redux';
import DrawerItem from './DrawerItem';
import { Icon, Text } from '../common';
import { LocaleReducer, Store } from '../../types';
import {
  HIT_SLOP, PADDING_BOTTOM,
  PADDING_TOP,
  SCREEN_HEIGHT,
  SCREEN_WIDTH,
  USAGE_PRIVACY,
  VERSION_NAME
} from '../../constants/Constants';
import { toggleWebview } from '../../actions/GeneralActions';

interface Props {
  navigation: DrawerNavigationProp<any, 'DrawerStack'>
}

const DrawerContent = ({ navigation }: Props) => {
  const { strings: { general: { versionNumber, additionalInfo }, exposuresHistory, languages }, isRTL } = useSelector<Store, LocaleReducer>(state => state.locale);
  const dispatch = useDispatch();

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
  }
});

export default DrawerContent;
