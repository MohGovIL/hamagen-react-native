import React, { useMemo, FunctionComponent, useState, useEffect } from 'react';
import { View, StyleSheet, ImageBackground, Share } from 'react-native';
import { useSafeArea } from 'react-native-safe-area-context';
import AsyncLock from 'async-lock';
import AsyncStorage from '@react-native-community/async-storage';
import { TouchableOpacity, Icon } from '../common';
import { onError } from '../../services/ErrorService';
import { ExternalUrls, Strings, Languages } from '../../locale/LocaleData';
import { HIT_SLOP, PADDING_TOP, SCREEN_HEIGHT, SCREEN_WIDTH, VERSION_NAME, SHOW_DOT_IN_VERSION, MENU_DOT_LAST_SEEN } from '../../constants/Constants';

interface ScanHomeHeaderProps {
  isRTL: boolean,
  strings: Strings,
  externalUrls: ExternalUrls,
  locale: string,
  languages: Languages,
  openDrawer(): void
}

const ScanHomeHeader: FunctionComponent<ScanHomeHeaderProps> = ({ isRTL, languages, locale, externalUrls, strings: { scanHome: { share: { message, title, androidTitle } } }, openDrawer, }) => {
  const messageAndUrl = useMemo(() => {
    const relevantLocale: string = Object.keys(languages.short).includes(locale) ? locale : 'he';
    return `${message}\n${externalUrls?.shareMessage?.[relevantLocale] ?? ''}`;
  }, [locale]);

  const [showDot, setShowDot] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(MENU_DOT_LAST_SEEN)
      .then((res) => {
        if (res) {
          if (res !== SHOW_DOT_IN_VERSION) setShowDot(true);
        } else {
          setShowDot(true);
        }
      })
      .catch(() => setShowDot(false));
  }, []);

  const onShare = async () => {
    try {
      await Share.share({ message: messageAndUrl, title }, { dialogTitle: androidTitle, subject: title });
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
        <TouchableOpacity
          hitSlop={HIT_SLOP}
          onPress={() => {
            openDrawer();
            setShowDot(false);
            AsyncStorage.setItem(MENU_DOT_LAST_SEEN, VERSION_NAME);
          }}
        >
          <Icon source={showDot ? require('../../assets/main/menuWithDot.png') : require('../../assets/main/menu.png')} width={20} />
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
    height: 24,
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
