import React from 'react';
import { View, StyleSheet, ImageBackground, TouchableWithoutFeedback, Share, Alert } from 'react-native';
import LottieView from 'lottie-react-native';
import { TouchableOpacity, Text, Icon } from '../common';
import { Strings } from '../../locale/LocaleData';
import { HIT_SLOP, PADDING_TOP, SCREEN_WIDTH } from '../../constants/Constants';
import { onError } from '../../services/ErrorService';


interface ShareBtnProps {
  strings: Strings,

}

const ShareBtn = ({ strings }: ShareBtnProps) => {
  const {
    scanHome: {
      share: {
        message,
        title,
        androidTitle
      }
    } } = strings;

  const onShare = async () => {
    try {
      const result = await Share.share({
        message,
        title,

      }, { dialogTitle: androidTitle });
    } catch (error) {
      onError({ error });
    }
  };

  return (
    <View style={styles.shareBtnContainer}>
      <TouchableOpacity hitSlop={HIT_SLOP} onPress={onShare}>
        <Icon source={require('../../assets/main/share.png')} width={20} />
      </TouchableOpacity>
    </View>
  );
};

interface ScanHomeHeaderProps {
  isRTL: boolean,
  strings: Strings,
  isConnected: boolean,
  showChangeLanguage: boolean,
  openDrawer(): void
}

const ScanHomeHeader = ({ strings, openDrawer }: ScanHomeHeaderProps) => {
  return (
    <ImageBackground
      source={require('../../assets/main/headerBG.png')}
      style={styles.imageContainer}
      resizeMode="stretch"
      resizeMethod="resize"
    >
      <View style={styles.container}>
        <ShareBtn strings={strings} />
        <View style={styles.logoContainer}>
          <Icon source={require('../../assets/main/headerLogo.png')} width={89} height={43} />
        </View>
        <View style={styles.menuContainer}>
          <TouchableOpacity hitSlop={HIT_SLOP} onPress={openDrawer}>
            <Icon source={require('../../assets/main/menu.png')} width={20} />
          </TouchableOpacity>
        </View>
      </View>
      <View style={styles.bottomEdge} />
    </ImageBackground>
  );
};

const styles = StyleSheet.create({

  imageContainer: {
    width: SCREEN_WIDTH,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: PADDING_TOP(10),
    paddingHorizontal: 20
  },
  container: {
    flexDirection: 'row',
    paddingBottom: 14
  },
  bottomEdge: {
    width: SCREEN_WIDTH,
    height: 45,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    backgroundColor: '#fff'
  },
  shareBtnContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'flex-start'
  },
  logoContainer: {
    flex: 3,
    justifyContent: 'center',
    alignItems: 'center'
  },
  menuContainer: {
    flex: 1,
    alignItems: 'flex-end',
    justifyContent: 'center'
  }
});

export default ScanHomeHeader;
