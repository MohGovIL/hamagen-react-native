import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, AppState, AppStateStatus, BackHandler, DeviceEventEmitter } from 'react-native';
import { connect } from 'react-redux';
import NetInfo, { NetInfoState } from '@react-native-community/netinfo';
import { RESULTS } from 'react-native-permissions';
import { bindActionCreators } from 'redux';
import SplashScreen from 'react-native-splash-screen';
import { useFocusEffect } from '@react-navigation/native';
// @ts-ignore
import RNSettings from 'react-native-settings';
import ScanHomeHeader from './ScanHomeHeader';
import NoData from './NoData';
import ExposuresDetected from './ExposuresDetected';
import NoExposures from './NoExposures';
import ExposureInstructions from './ExposureInstructions';
import { checkForceUpdate, checkIfHideLocationHistory, toggleWebview } from '../../actions/GeneralActions';
import { dismissExposure, removeValidExposure, setValidExposure } from '../../actions/ExposuresActions';
import { checkPermissions } from '../../services/LocationService';
import { Exposure } from '../../types';

interface Props {
  navigation: any,
  isRTL: boolean,
  strings: any,
  locale: 'he'|'en'|'ar'|'am'|'ru'|'fr',
  exposures: Exposure[],
  validExposure: Exposure,
  firstPoint?: number,
  hideLocationHistory: boolean,
  setValidExposure(exposure: Exposure): void,
  removeValidExposure(): void,
  dismissExposure(exposureId: number): void,
  toggleWebview(isShow: boolean, usageType: string): void,
  checkForceUpdate(): void,
  checkIfHideLocationHistory(): void
}

const ScanHome = (
  {
    navigation,
    isRTL,
    strings,
    locale,
    exposures,
    validExposure,
    setValidExposure,
    removeValidExposure,
    dismissExposure,
    toggleWebview,
    firstPoint,
    hideLocationHistory,
    checkForceUpdate,
    checkIfHideLocationHistory
  }: Props
) => {
  const appStateStatus = useRef<AppStateStatus>('active');
  const [{ hasLocation, hasNetwork, hasGPS }, setIsConnected] = useState({ hasLocation: true, hasNetwork: true, hasGPS: true });

  useEffect(() => {
    setTimeout(() => {
      SplashScreen.hide();
      checkForceUpdate();
    }, 3000);

    checkIfHideLocationHistory();
    checkConnectionStatusOnLoad();

    AppState.addEventListener('change', onAppStateChange);
    NetInfo.addEventListener((state: NetInfoState) => {
      setIsConnected({ hasLocation, hasNetwork: state.isConnected, hasGPS });
    });

    DeviceEventEmitter.addListener(RNSettings.GPS_PROVIDER_EVENT, handleGPSProviderEvent);

    return () => {
      AppState.removeEventListener('change', onAppStateChange);
      DeviceEventEmitter.removeListener(RNSettings.GPS_PROVIDER_EVENT, handleGPSProviderEvent);
    };
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      const onBackPress = () => {
        BackHandler.exitApp();
        return true;
      };

      BackHandler.addEventListener('hardwareBackPress', onBackPress);

      return () => {
        BackHandler.removeEventListener('hardwareBackPress', onBackPress);
      };
    }, [])
  );

  const checkConnectionStatusOnLoad = async () => {
    const locationPermission = await checkPermissions();
    const networkStatus = await NetInfo.fetch();
    const GPSStatus = await RNSettings.getSetting(RNSettings.LOCATION_SETTING);

    setIsConnected({ hasLocation: locationPermission === RESULTS.GRANTED, hasNetwork: networkStatus.isConnected, hasGPS: GPSStatus === RNSettings.ENABLED });
  };

  const onAppStateChange = async (state: AppStateStatus) => {
    if (state === 'active' && appStateStatus.current !== 'active') {
      checkIfHideLocationHistory();

      const locationPermission = await checkPermissions();
      const GPSStatus = await RNSettings.getSetting(RNSettings.LOCATION_SETTING);

      setIsConnected({ hasLocation: locationPermission === RESULTS.GRANTED, hasNetwork, hasGPS: GPSStatus === RNSettings.ENABLED });
    }

    appStateStatus.current = state;
  };

  const handleGPSProviderEvent = (e: any) => {
    setIsConnected({ hasLocation, hasNetwork, hasGPS: e[RNSettings.LOCATION_SETTING] === RNSettings.ENABLED });
  };

  const renderRelevantState = () => {
    if (validExposure) {
      return (
        <ExposureInstructions isRTL={isRTL} strings={strings} locale={locale} exposure={validExposure} removeValidExposure={removeValidExposure} />
      );
    } if (!hasLocation || !hasNetwork) {
      return (
        <NoData strings={strings} />
      );
    } if (exposures.length > 0) {
      return (
        <ExposuresDetected
          isRTL={isRTL}
          strings={strings}
          exposures={exposures}
          onValidExposure={exposure => setValidExposure(exposure)}
          dismissExposure={exposureId => dismissExposure(exposureId)}
        />
      );
    }

    return (
      <NoExposures
        isRTL={isRTL}
        strings={strings}
        toggleWebview={toggleWebview}
        firstPoint={firstPoint}
        hideLocationHistory={hideLocationHistory}
        goToLocationHistory={() => navigation.navigate('LocationHistory')}
      />
    );
  };

  return (
    <View style={styles.container}>
      <ScanHomeHeader
        isRTL={isRTL}
        strings={strings}
        isConnected={hasLocation && hasNetwork && hasGPS}
        showChangeLanguage
        goToExposureHistory={() => navigation.navigate('ExposuresHistory')}
      />

      {
        renderRelevantState()
      }
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff'
  }
});

const mapStateToProps = (state: any) => {
  const {
    locale: { isRTL, strings, locale },
    general: { hideLocationHistory },
    exposures: { exposures, validExposure, firstPoint }
  } = state;

  return { isRTL, strings, locale, exposures, validExposure, firstPoint, hideLocationHistory };
};


const mapDispatchToProps = (dispatch: any) => {
  return bindActionCreators({
    setValidExposure,
    removeValidExposure,
    dismissExposure,
    toggleWebview,
    checkForceUpdate,
    checkIfHideLocationHistory
  }, dispatch);
};

export default connect(mapStateToProps, mapDispatchToProps)(ScanHome);
