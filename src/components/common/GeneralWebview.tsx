import React from 'react';
import { View, StyleSheet, Modal, ImageBackground } from 'react-native';
import WebView from 'react-native-webview';
import { TouchableOpacity, Icon } from '.';
import config from '../../config/config';
import { IS_SMALL_SCREEN, PADDING_TOP, SCREEN_HEIGHT, SCREEN_WIDTH, USAGE_PRIVACY } from '../../constants/Constants';

interface Props {
  isVisible: boolean,
  locale: 'he'|'en'|'ar'|'am'|'ru',
  usageType: string,
  closeWebview(): void
}

const GeneralWebview = ({ isVisible, locale, closeWebview, usageType }: Props) => {
  const usageSourceOnBoarding = config().usageTerms;
  const usageSourcePrivacy = config().privacyTerms;

  return (
    <Modal
      visible={isVisible}
      transparent
      animationType="slide"
      onRequestClose={closeWebview}
    >
      <View style={styles.container}>
        <ImageBackground
          source={require('../../assets/main/headerBG.png')}
          style={styles.headerContainer}
          resizeMode="cover"
          resizeMethod="resize"
        >
          <TouchableOpacity style={styles.close} onPress={closeWebview}>
            <Icon source={require('../../assets/onboarding/close.png')} width={IS_SMALL_SCREEN ? 20 : 31} />
          </TouchableOpacity>

          <View style={styles.headerSubContainer} />
        </ImageBackground>

        <WebView
          style={{ flex: 1 }}
          source={{ uri: usageType === USAGE_PRIVACY ? usageSourcePrivacy[locale] : usageSourceOnBoarding[locale] }}
          startInLoadingState
          showsVerticalScrollIndicator={false}
          showsHorizontalScrollIndicator={false}
          allowsBackForwardNavigationGestures
          allowsInlineMediaPlayback
        />
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff'
  },
  close: {
    position: 'absolute',
    top: PADDING_TOP(IS_SMALL_SCREEN ? 10 : 20),
    left: IS_SMALL_SCREEN ? 10 : 20,
    zIndex: 1000
  },
  headerContainer: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT * 0.17,
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingTop: PADDING_TOP(0)
  },
  headerSubContainer: {
    width: SCREEN_WIDTH,
    height: 40,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    backgroundColor: '#fff'
  }
});

export { GeneralWebview };
