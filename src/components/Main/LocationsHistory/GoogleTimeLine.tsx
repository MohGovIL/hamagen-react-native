import React, { useRef, useState } from 'react';
import { Text, View, Button, Modal } from 'react-native';
import { WebView, WebViewMessageEvent } from 'react-native-webview';
import { getLastNrDaysKmlUrls, kmlToGeoJson } from './utils';

const GoogleTimeLine = () => {
  const webViewRef = useRef<any>(null);
  const [openWebview, setOpenWebview] = useState(false);

  const onMessage = async ({ nativeEvent: { data } }: WebViewMessageEvent) => {
    if (!data) {
      return;
    }

    if (data === 'LOGGED_IN') {
      webViewRef.current.injectJavaScript('document.getElementsByTagName(\'html\')[0].innerHTML = \'Fetching location data of the last 14 days...\'');

      const kmlUrls = getLastNrDaysKmlUrls();

      const responses = await Promise.all(kmlUrls.map(url => fetch(url)));
      const texts = await Promise.all(responses.map(r => r.text()));

      texts.forEach(text => kmlToGeoJson(text));

      webViewRef.current.injectJavaScript('document.getElementsByTagName(\'html\')[0].innerHTML = \'Done!\'');
    }
  };

  return (
    <View>
      <Text> Test - Google Timeline</Text>
      <Button title="Open" onPress={() => setOpenWebview(true)} />

      <Modal
        visible={openWebview}
        animationType="slide"
        onRequestClose={() => setOpenWebview(false)}
      >
        <WebView
          ref={webViewRef}
          originWhitelist={['*']}
          onMessage={onMessage}
          injectedJavaScript={`(function() {
            window.ReactNativeWebView.postMessage("BEFORE IF");
            if(window.location.href.startsWith('https://myaccount.google.com/?utm_source=sign_in_no_continue')) {
                window.ReactNativeWebView.postMessage("LOGGED_IN");
            }
            })();`
          }
          source={{ uri: 'https://accounts.google.com/signin/v2/identifier?service=accountsettings&flowName=GlifWebSignIn&flowEntry=ServiceLogin', }}
          startInLoadingState
        />
      </Modal>
    </View>
  );
};

export default GoogleTimeLine;
