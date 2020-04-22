import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, AppState, AppStateStatus, BackHandler, DeviceEventEmitter, Linking } from 'react-native';
import { connect } from 'react-redux';
import { DrawerNavigationProp } from '@react-navigation/drawer';
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
import { checkForceUpdate, checkIfHideLocationHistory } from '../../actions/GeneralActions';
import { dismissExposure, removeValidExposure, setValidExposure } from '../../actions/ExposuresActions';
import { checkLocationPermissions, goToFilterDrivingIfNeeded } from '../../services/LocationService';
import { onOpenedFromDeepLink } from '../../services/DeepLinkService';
import { ExternalUrls, Languages, Strings } from '../../locale/LocaleData';
import { Exposure } from '../../types';

interface Props {
  navigation: DrawerNavigationProp<any>,
  isRTL: boolean,
  strings: Strings,
  locale: string,
  languages: Languages,
  externalUrls: ExternalUrls,
  exposures: Exposure[],
  validExposure: Exposure,
  firstPoint?: number,
  hideLocationHistory: boolean,
  setValidExposure(exposure: Exposure): void,
  removeValidExposure(): void,
  dismissExposure(exposureId: number): void,
  checkForceUpdate(): void,
  checkIfHideLocationHistory(): void
}

const ScanHome = (
  {
    navigation,
    isRTL,
    strings,
    locale,
    languages,
    externalUrls,
    exposures,
    validExposure,
    setValidExposure,
    removeValidExposure,
    dismissExposure,
    firstPoint,
    hideLocationHistory,
    checkForceUpdate,
    checkIfHideLocationHistory
  }: Props
) => {
  const appStateStatus = useRef<AppStateStatus>('active');
  const [{ hasLocation, hasNetwork, hasGPS }, setIsConnected] = useState({ hasLocation: true, hasNetwork: true, hasGPS: true });

  useEffect(() => {
    setTimeout(async () => {
      SplashScreen.hide();
      checkForceUpdate();
      goToFilterDrivingIfNeeded(navigation);

      const url = await Linking.getInitialURL();

      if (url) {
        return onOpenedFromDeepLink(url, navigation);
      }
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
    const locationPermission = await checkLocationPermissions();
    const networkStatus = await NetInfo.fetch();
    const GPSStatus = await RNSettings.getSetting(RNSettings.LOCATION_SETTING);

    setIsConnected({ hasLocation: locationPermission === RESULTS.GRANTED, hasNetwork: networkStatus.isConnected, hasGPS: GPSStatus === RNSettings.ENABLED });
  };

  const onAppStateChange = async (state: AppStateStatus) => {
    if (state === 'active' && appStateStatus.current !== 'active') {
      checkIfHideLocationHistory();

      const locationPermission = await checkLocationPermissions();
      const GPSStatus = await RNSettings.getSetting(RNSettings.LOCATION_SETTING);
      const networkStatus = await NetInfo.fetch();

      setIsConnected({ hasLocation: locationPermission === RESULTS.GRANTED, hasNetwork: networkStatus.isConnected, hasGPS: GPSStatus === RNSettings.ENABLED });
    }

    appStateStatus.current = state;
  };

  const handleGPSProviderEvent = (e: any) => {
    setIsConnected({ hasLocation, hasNetwork, hasGPS: e[RNSettings.LOCATION_SETTING] === RNSettings.ENABLED });
  };

  const renderRelevantState = () => {
    if (validExposure) {
      return (
        <ExposureInstructions
          isRTL={isRTL}
          strings={strings}
          locale={locale}
          languages={languages}
          externalUrls={externalUrls}
          exposure={validExposure}
          removeValidExposure={removeValidExposure}
        />
      );
    } if (!hasLocation || !hasNetwork || !hasGPS) {
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
        openDrawer={navigation.openDrawer}
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
    backgroundColor: '#fff',
  }
});

const mapStateToProps = (state: any) => {
  const {
    locale: { isRTL, strings, locale, languages, externalUrls },
    general: { hideLocationHistory },
    exposures: { exposures, validExposure, firstPoint }
  } = state;

  return { isRTL, strings, locale, languages, externalUrls, exposures, validExposure, firstPoint, hideLocationHistory };
};


const mapDispatchToProps = (dispatch: any) => {
  return bindActionCreators({
    setValidExposure,
    removeValidExposure,
    dismissExposure,
    checkForceUpdate,
    checkIfHideLocationHistory
  }, dispatch);
};

export default connect(mapStateToProps, mapDispatchToProps)(ScanHome);
