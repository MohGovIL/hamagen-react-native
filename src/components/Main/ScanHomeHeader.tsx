import React, { useMemo } from 'react';
import { View, StyleSheet, ImageBackground, Share } from 'react-native';
import { TouchableOpacity, Icon } from '../common';
import { onError } from '../../services/ErrorService';
import { ExternalUrls,Strings, Languages } from '../../locale/LocaleData';
import { HIT_SLOP, PADDING_TOP, SCREEN_HEIGHT, SCREEN_WIDTH } from '../../constants/Constants';

interface ScanHomeHeaderProps {
  isRTL: boolean,
  strings: Strings,
  externalUrls: ExternalUrls,
  locale: string,
  languages: Languages,
  openDrawer(): void
}

const ScanHomeHeader = ({ isRTL,languages,locale,externalUrls,strings: { scanHome: { share: { message, title, androidTitle } } }, openDrawer }: ScanHomeHeaderProps) => {
  const messageAndUrl = useMemo(()=> {
    const relevantLocale: string = Object.keys(languages.short).includes(locale) ? locale : 'he';
    return `${message}\n${externalUrls?.shareMessage?.[relevantLocale] ?? ''}`
  }, [locale])


  const onShare = async () => {
    try {
      await Share.share({ message: messageAndUrl, title }, { dialogTitle: androidTitle, subject: title});
    } catch (error) {
      onError({ error });
    }
  };

  return (
    <ImageBackground
      source={require('../../assets/main/headerBG.png')}
      style={styles.imageContainer}
      resizeMode="stretch"
      resizeMethod="resize"
    >
      <View style={[styles.container, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
        <TouchableOpacity hitSlop={HIT_SLOP} onPress={openDrawer}>
          <Icon source={require('../../assets/main/menu.png')} width={20} />
        </TouchableOpacity>

        <View style={styles.logoContainer}>
          <Icon source={require('../../assets/main/headerLogo.png')} width={89} height={43} />
        </View>

        <TouchableOpacity hitSlop={HIT_SLOP} onPress={onShare}>
          <Icon source={require('../../assets/main/share.png')} width={20} />
        </TouchableOpacity>
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
    paddingTop: PADDING_TOP(0),
    paddingHorizontal: 20
  },
  container: {
    height: SCREEN_HEIGHT * 0.085,
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  bottomEdge: {
    width: SCREEN_WIDTH,
    height: 45,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    backgroundColor: '#fff'
  },
  logoContainer: {
    flex: 3,
    justifyContent: 'center',
    alignItems: 'center'
  }
});

export default ScanHomeHeader;
