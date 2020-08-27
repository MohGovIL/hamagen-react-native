import { DrawerNavigationProp } from '@react-navigation/drawer';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { toggleWebview } from '../../actions/GeneralActions';
import {
  PADDING_BOTTOM,
  PADDING_TOP,
  SCREEN_HEIGHT,
  SCREEN_WIDTH,
  USAGE_PRIVACY
} from '../../constants/Constants';
import { Store } from '../../types';
import { Icon, Text } from '../common';
import DrawerItem from './DrawerItem';

interface Props {
  navigation: DrawerNavigationProp<any, 'DrawerStack'>
}

const HomeDrawerContent = ({ navigation, showSettings }: Props) => {
  const dispatch = useDispatch();

  const { locale: { strings: { general: { versionNumber, additionalInfo }, exposuresHistory, languages, menu: { settings } }, isRTL }, general: { enableBle, batteryDisabled } } = useSelector<Store, Store>(state => state);


  return (
    <View style={[styles.container]}>
      <DrawerItem
        isRTL={isRTL}
        icon={require('../../assets/main/history.png')}
        label={exposuresHistory.title}
        onPress={() => {
          navigation.navigate('ExposuresHistory');
        }}
      />

      <DrawerItem
        isRTL={isRTL}
        icon={require('../../assets/main/lang.png')}
        label={languages.title}
        onPress={() => {
          navigation.navigate('ChangeLanguageScreen');
        }}
      />
      <DrawerItem
        isRTL={isRTL}
        icon={require('../../assets/main/settingsMenu.png')}
        style={{ alignItems: 'center', }}
        label={(
          <>
            <Text style={{ paddingHorizontal: 19, fontSize: 18, textAlign: isRTL ? 'right' : 'left' }}>{settings.label}</Text>
            <View style={{ position: 'absolute', top: 0, bottom: 0, right: 19, justifyContent: 'center' }}>

              <Icon
                width={13}
                source={require('../../assets/main/menuBack.png')}
                customStyles={{ transform: [{ rotateY: isRTL ? '180deg' : '0deg' }] }}
              />
            </View>
          </>
)}
        onPress={showSettings}
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
  );
};

const styles = StyleSheet.create({
  container: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    paddingTop: PADDING_TOP(SCREEN_HEIGHT * 0.15)
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

export default HomeDrawerContent;
