import React from 'react';
import { View, StyleSheet, Modal } from 'react-native';
import WebView from 'react-native-webview';
import { WebviewHeader } from '.';
import config from '../../config/config';
import { USAGE_PRIVACY } from '../../constants/Constants';

interface Props {
  isVisible: boolean,
  locale: string,
  usageType: string,
  closeWebview(): void
}

const GeneralWebview = ({ isVisible, locale, closeWebview, usageType }: Props) => {
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
          source={{ uri: usageType === USAGE_PRIVACY ? config().privacyTerms[locale] : config().usageTerms[locale] }}
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
