import AsyncStorage from '@react-native-community/async-storage';
import React, { FunctionComponent, useEffect, useMemo, useState } from 'react';
import { ImageBackground, Share, StyleSheet, View } from 'react-native';
import { HIT_SLOP, MENU_DOT_LAST_SEEN, PADDING_TOP, SCREEN_HEIGHT, SCREEN_WIDTH, SHOW_DOT_BY_BUILD_NUMBER, VERSION_BUILD } from '../../constants/Constants';
import { ExternalUrls, Languages, Strings } from '../../locale/LocaleData';
import { toggleBLEService } from '../../services/BLEService';
import { onError } from '../../services/ErrorService';
import { Icon, TouchableOpacity } from '../common';

interface ScanHomeHeaderProps {
  isRTL: boolean,
  strings: Strings,
  externalUrls: ExternalUrls,
  locale: string,
  languages: Languages,
  enableBle: boolean | null,
  openDrawer(): void
}

const ScanHomeHeader: FunctionComponent<ScanHomeHeaderProps> = ({ isRTL, languages, locale, externalUrls, strings: { scanHome: { share: { message, title, androidTitle } } }, openDrawer, enableBle }) => {
  const messageAndUrl = useMemo(() => {
    const relevantLocale: string = Object.keys(languages.short).includes(locale) ? locale : 'he';
    return `${message}\n${externalUrls?.shareMessage?.[relevantLocale] ?? ''}`;
  }, [locale]);

  const [showDot, setShowDot] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(MENU_DOT_LAST_SEEN)
      .then((res) => {
        if (res) {
          if (parseInt(res) < SHOW_DOT_BY_BUILD_NUMBER) {
            setShowDot(true);
          } else {
            setShowDot(false);
          }
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
            showDot && setShowDot(false);
            AsyncStorage.setItem(MENU_DOT_LAST_SEEN, VERSION_BUILD);
          }}
        >
          <Icon source={showDot ? require('../../assets/main/menuWithDot.png') : require('../../assets/main/menu.png')} width={20} />
        </TouchableOpacity>

        <View style={styles.logoContainer}>
          <Icon source={require('../../assets/main/headerLogo.png')} width={89} height={43} />
        </View>
        <View style={{ flexDirection: isRTL ? 'row-reverse' : 'row' }}>
          {enableBle !== null && (
          <TouchableOpacity style={{ marginHorizontal: 20 }} hitSlop={HIT_SLOP} onPress={() => toggleBLEService(Boolean(!enableBle))}>
            <Icon source={enableBle ? require('../../assets/main/bluetoothOnBtn.png') : require('../../assets/main/bluetoothOffBtn.png')} width={23} />
          </TouchableOpacity>
          )}
          <TouchableOpacity hitSlop={HIT_SLOP} onPress={onShare}>
            <Icon source={require('../../assets/main/share.png')} width={20} />
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
