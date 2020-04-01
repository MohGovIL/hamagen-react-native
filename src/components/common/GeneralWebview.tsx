import React from 'react';
import { View, StyleSheet, Modal } from 'react-native';
import WebView from 'react-native-webview';
import { WebviewHeader } from '.';
import { ExternalUrls } from '../../locale/LocaleData';
import { USAGE_PRIVACY } from '../../constants/Constants';

interface Props {
  isVisible: boolean,
  locale: string,
  externalUrls: ExternalUrls,
  usageType: string,
  closeWebview(): void
}

const GeneralWebview = ({ isVisible, locale, externalUrls, closeWebview, usageType }: Props) => {
  return (
    <Modal
      visible={isVisible}
      transparent
      animationType="slide"
      onRequestClose={closeWebview}
    >
      <View style={styles.container}>
        <WebviewHeader closeModal={closeWebview} />

        <WebView
          style={{ flex: 1 }}
          source={{ uri: usageType === USAGE_PRIVACY ? externalUrls.privacyTerms[locale] : externalUrls.usageTerms[locale] }}
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
  }
});

export { GeneralWebview };
