import React, { RefObject, useRef, useState } from 'react';
import { Modal, StyleSheet, View } from 'react-native';
import { WebView, WebViewMessageEvent } from 'react-native-webview';
import AsyncStorage from '@react-native-community/async-storage';
import {
  getLastNrDaysKmlUrls,
  getLoadingHTML,
  insertToSampleDB,
  kmlToGeoJson
} from '../../services/LocationHistoryService';
import { WebviewHeader, TouchableOpacity, Icon, ActionButton, Text } from '.';
import { checkIfHideLocationHistory } from '../../actions/GeneralActions';
import { onError } from '../../services/ErrorService';
import store from '../../store';
import {
  IS_SMALL_SCREEN,
  MAIN_COLOR,
  SCREEN_WIDTH,
  SHOULD_HIDE_LOCATION_HISTORY,
  USAGE_PRIVACY
} from '../../constants/Constants';

interface FetchHistoryModalProps {
  isVisible: boolean,
  webViewRef: RefObject<any>,
  isLoggedIn: boolean,
  onMessage(event: WebViewMessageEvent): void,
  closeModal(): void
}

const FetchHistoryModal = ({ isVisible, isLoggedIn, webViewRef, onMessage, closeModal }:FetchHistoryModalProps) => {
  return (
    <Modal
      visible={isVisible}
      animationType="slide"
      onRequestClose={isLoggedIn ? () => {} : closeModal}
    >
      <View style={styles.container}>
        <WebviewHeader hideClose={isLoggedIn} closeModal={closeModal} />

        <WebView
          style={{ flex: 1, width: SCREEN_WIDTH }}
          ref={webViewRef}
          source={{ uri: 'https://accounts.google.com/signin/v2/identifier?service=accountsettings&flowName=GlifWebSignIn&flowEntry=ServiceLogin', }}
          startInLoadingState
          onMessage={onMessage}
          injectedJavaScript={`(function() {
            if(window.location.href.startsWith('https://myaccount.google.com/?utm_source=sign_in_no_continue')) {
                window.ReactNativeWebView.postMessage("LOGGED_IN");
            }
            })();`
          }
          originWhitelist={['*']}
        />
      </View>
    </Modal>
  );
};

interface GoogleTimeLineProps {
  strings: any,
  toggleWebview(isShow: boolean, usageType: string): void,
  onCompletion(): void
}

interface State {
  openWebview: boolean,
  isLoggedIn: boolean,
  state: 'before'|'successFound'|'successNotFound'|'failed'
}

const GoogleTimeLine = ({ strings, toggleWebview, onCompletion }: GoogleTimeLineProps) => {
  const {
    general: { additionalInfo },
    locationHistory: { beforeCheckTitle, beforeCheckDesc, beforeCheckDesc2, beforeCheckButton, skip, successFoundTitle, successFoundDesc, successFoundButton, successNotFoundTitle, successNotFoundDesc, successNotFoundButton, failedTitle, failedDesc, failedButton }
  } = strings;

  const webViewRef = useRef<WebView>(null);

  const [{ openWebview, isLoggedIn, state }, setState] = useState<State>({ openWebview: false, isLoggedIn: false, state: 'before' });

  const pageStateConfig = () => {
    switch (state) {
      case 'before': {
        return {
          icon: require('../../assets/locationHistory/before.png'),
          title: beforeCheckTitle,
          desc1: beforeCheckDesc,
          desc2: beforeCheckDesc2,
          button: beforeCheckButton,
          action: () => setState(prevState => ({ ...prevState, openWebview: true }))
        };
      }

      case 'successFound': {
        return {
          icon: require('../../assets/locationHistory/successFound.png'),
          title: successFoundTitle,
          desc1: successFoundDesc,
          desc2: '',
          button: successFoundButton,
          action: () => onCompletion()
        };
      }

      case 'successNotFound': {
        return {
          icon: require('../../assets/locationHistory/successNotFound.png'),
          title: successNotFoundTitle,
          desc1: successNotFoundDesc,
          desc2: '',
          button: successNotFoundButton,
          action: () => onCompletion()
        };
      }

      case 'failed': {
        return {
          icon: require('../../assets/locationHistory/failed.png'),
          title: failedTitle,
          desc1: failedDesc,
          desc2: '',
          button: failedButton,
          action: () => setState(prevState => ({ ...prevState, openWebview: true }))
        };
      }

      default: { return { icon: 0, title: '', desc1: '', desc2: '', button: '', action: () => {} }; }
    }
  };

  const onMessage = async ({ nativeEvent: { data } }: WebViewMessageEvent) => {
    if (!data) {
      return;
    }

    if (data === 'LOGGED_IN' && !isLoggedIn) {
      try {
        webViewRef.current?.injectJavaScript(`document.getElementsByTagName(\'html\')[0].innerHTML = \'${getLoadingHTML()}\'; true;`);

        setState(prevState => ({ ...prevState, isLoggedIn: true }));

        const kmlUrls = getLastNrDaysKmlUrls();

        const texts = await Promise.all(kmlUrls.map(url => fetch(url).then(r => r.text())));

        if (texts[0].indexOf('DOCTYPE') > -1 && texts[0].indexOf('Error') > -1) {
          return onFetchError('Fetch KML error');
        }

        const pointsData = texts.flatMap((kml: string) => kmlToGeoJson(kml));

        if (pointsData.length === 0) {
          // once 14 days flow completed for the first time
          await AsyncStorage.setItem(SHOULD_HIDE_LOCATION_HISTORY, 'true');
          store().dispatch(checkIfHideLocationHistory());
          return setState(prevState => ({ ...prevState, openWebview: false, isLoggedIn: false, state: 'successNotFound' }));
        }

        await insertToSampleDB(pointsData);

        setState(prevState => ({ ...prevState, openWebview: false, isLoggedIn: false, state: 'successFound' }));
      } catch (error) {
        await onFetchError(error);
      }
    }
  };

  const onFetchError = async (error: any) => {
    setState(prevState => ({ ...prevState, openWebview: false, isLoggedIn: false, state: 'failed' }));
    onError({ error });
  };

  return (
    <View style={styles.container}>
      <View style={styles.textsContainer}>
        {
          (!IS_SMALL_SCREEN || state !== 'before') && (
            <Icon source={pageStateConfig().icon} width={154} height={64} customStyles={{ marginBottom: 50 }} />
          )
        }
        <Text style={styles.title} bold>{pageStateConfig().title}</Text>
        <Text style={{ marginBottom: 20 }}>{pageStateConfig().desc1}</Text>
        <Text bold>{pageStateConfig().desc2}</Text>
      </View>

      {
        state === 'before' && (
          <TouchableOpacity onPress={() => toggleWebview(true, USAGE_PRIVACY)}>
            <Text style={{ fontSize: 14 }}>{additionalInfo}</Text>
            <View style={styles.bottomBorder} />
          </TouchableOpacity>
        )
      }

      <View style={{ alignItems: 'center' }}>
        <ActionButton text={pageStateConfig().button} onPress={pageStateConfig().action} containerStyle={{ marginBottom: 15 }} />

        <View style={{ height: 20 }}>
          {
            (state === 'before' || state === 'failed') && (
              <TouchableOpacity onPress={onCompletion}>
                <Text style={{ fontSize: 20 }}>{skip}</Text>
              </TouchableOpacity>
            )
          }
        </View>
      </View>

      <FetchHistoryModal
        webViewRef={webViewRef}
        isVisible={openWebview}
        onMessage={onMessage}
        isLoggedIn={isLoggedIn}
        closeModal={() => setState(prevState => ({ ...prevState, openWebview: false }))}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff'
  },
  textsContainer: {
    alignItems: 'center',
    paddingHorizontal: IS_SMALL_SCREEN ? 10 : 20
  },
  title: {
    fontSize: 22,
    marginBottom: 20,
  },
  bottomBorder: {
    alignSelf: 'stretch',
    height: 2,
    borderRadius: 1,
    backgroundColor: MAIN_COLOR
  }
});

export { GoogleTimeLine };
