import AsyncStorage from '@react-native-community/async-storage';
import { CardStyleInterpolators, createStackNavigator } from '@react-navigation/stack';
import moment from 'moment';
import React, { FunctionComponent, useEffect, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { connect } from 'react-redux';
import { setExposures } from '../actions/ExposuresActions';
import { checkForceUpdate, setOnboardingRoutes, toggleWebview } from '../actions/GeneralActions';
import { initLocale } from '../actions/LocaleActions';
import { initConfig } from '../config/config';
import {
  HIDE_FORCE_TERMS, RESET_EXPOSURES,


  SHOW_FORCE_TERMS, UPDATE_FIRST_POINT
} from '../constants/ActionTypes';
import {
  CURRENT_TERMS_VERSION,


  DISMISSED_EXPOSURES, FIRST_POINT_TS,
  IS_FIRST_TIME,
  IS_IOS,


  SICK_DB_UPDATED, USAGE_ON_BOARDING,
  VALID_EXPOSURE
} from '../constants/Constants';
import { IntersectionSickDatabase } from '../database/Database';
import { ExternalUrls, Strings } from '../locale/LocaleData';
import ResetMessaging from '../ResetMessaging';
import { registerBLEListeners } from '../services/BLEService';
import { clusterLocationsOnAppUpdate } from '../services/ClusteringService';
import { onError } from '../services/ErrorService';
import { updateLocationsTimesToUTC } from '../services/LocationService';
import { subscribeToTopic } from '../services/PushService';
import { purgeSamplesDB } from '../services/SampleService';
import { startForegroundTimer } from '../services/Tracker';
import store from '../store';
import ChangeLanguage from './ChangeLanguage/ChangeLanguageModal';
import { ForceTerms, ForceUpdate, GeneralWebview, Loader } from './common';
import Home from './Drawer/Home';
import OnboardingRoutes from './Onboarding/OnboardingRoutes';

interface Props {
  isInitLocale: boolean,
  isRTL: boolean,
  strings: Strings,
  locale: string,
  externalUrls: ExternalUrls,
  showLoader: boolean,
  showWebview: boolean,
  showForceUpdate: boolean,
  shouldForce: boolean,
  showChangeLanguage: boolean,
  usageType: string,
  showForceTerms: boolean,
  termsVersion: number,
  isOnboarding: boolean,
  initLocale(): void,
  toggleWebview(isShow: boolean, usageType: string): void,
  checkForceUpdate(): void,
  setOnboardingRoutes(state: boolean): void
}

const Loading: FunctionComponent<Props> = (
  {
    isInitLocale,
    isRTL,
    showLoader,
    showChangeLanguage,
    strings,
    locale,
    externalUrls,
    showWebview,
    usageType,
    showForceUpdate,
    shouldForce,
    showForceTerms,
    termsVersion,
    isOnboarding,
    initLocale,
    toggleWebview,
    checkForceUpdate,
    setOnboardingRoutes
  }
) => {
  const shouldShowForceTerms = useRef(false);

  const [initialRoute, setInitialRoute] = useState('');

  useEffect(() => {
    registerBLEListeners();
    appLoadingActions();
  }, []);

  useEffect(() => {
    if (!showWebview && shouldShowForceTerms.current) {
      store().dispatch({ type: SHOW_FORCE_TERMS, payload: { terms: termsVersion } });
      shouldShowForceTerms.current = false;
    }
  }, [showWebview]);

  const appLoadingActions = async () => {
    try {
      await updateLocationsTimesToUTC();
      await initConfig();
      initLocale();
      subscribeToTopic();

      !IS_IOS && await store().dispatch({ type: RESET_EXPOSURES }); // first thing - clear the redux store to fix the android duplications bug

      const notFirstTime = await AsyncStorage.getItem(IS_FIRST_TIME);

      if (notFirstTime === null) {
        return setInitialRoute('Welcome');
      }

      await onBoardingCompletedActions();
    } catch (error) {
      setInitialRoute('Welcome');
      onError({ error });
    }
  };

  const onBoardingCompletedActions = async () => {
    try {
      setOnboardingRoutes(false);
      const dbSick = new IntersectionSickDatabase();

      await migrateIntersectionSickDatabase(dbSick);
      // don't init config second time
      ResetMessaging(false);

      await purgeSamplesDB();
      await clusterLocationsOnAppUpdate();
      startForegroundTimer();

      // remove intersections older then 2 weeks
      await dbSick.purgeIntersectionSickTable(moment().subtract(2, 'week').unix() * 1000);
      // await dbSick.deleteAll()
      const exposures = await dbSick.listAllRecords();

      await store().dispatch(setExposures(exposures.map((exposure: any) => ({ properties: { ...exposure } }))));

      const firstPointTS = JSON.parse(await AsyncStorage.getItem(FIRST_POINT_TS) || 'false');
      firstPointTS && store().dispatch({ type: UPDATE_FIRST_POINT, payload: firstPointTS });

      setInitialRoute('Home');
    } catch (error) {
      setInitialRoute('Home');
      onError({ error });
    }
  };

  const onSeeTerms = () => {
    store().dispatch({ type: HIDE_FORCE_TERMS });
    shouldShowForceTerms.current = true;
    setTimeout(() => toggleWebview(true, USAGE_ON_BOARDING), 300);
  };

  const onApprovedTerms = async () => {
    store().dispatch({ type: HIDE_FORCE_TERMS });
    await AsyncStorage.setItem(CURRENT_TERMS_VERSION, JSON.stringify(termsVersion));
    checkForceUpdate();
  };

  const Stack = createStackNavigator();

  return (
    (!isInitLocale || !initialRoute) ? null : (
      <View style={styles.container}>
        <Stack.Navigator mode="modal" headerMode="none" initialRouteName={initialRoute} screenOptions={() => ({ gestureEnabled: false })}>
          {isOnboarding ? <Stack.Screen name="onBoarding" component={OnboardingRoutes} options={{ cardStyleInterpolator: CardStyleInterpolators.forScaleFromCenterAndroid }} />
            : <Stack.Screen name="Home" component={Home} options={{ cardStyleInterpolator: CardStyleInterpolators.forScaleFromCenterAndroid }} initialParams={{ isRTL }} />}
        </Stack.Navigator>

        <Loader isVisible={showLoader} />
        <ChangeLanguage isVisible={showChangeLanguage} />
        <GeneralWebview isVisible={showWebview} locale={locale} externalUrls={externalUrls} closeWebview={() => toggleWebview(false, '')} usageType={usageType} />
        <ForceUpdate isVisible={showForceUpdate} shouldForce={shouldForce} strings={strings} />
        <ForceTerms isVisible={showForceTerms} isRTL={isRTL} strings={strings} onSeeTerms={onSeeTerms} onApprovedTerms={onApprovedTerms} />
      </View>
    )
  );
};

// migrate table to have wasThere and bleTimestamp
// update valid exposure to have was there true
// update all dismissed exposures to have wasThere property
const migrateIntersectionSickDatabase = async (dbSick: any) => {
  try {
    const dbSickWasUpdated = await AsyncStorage.getItem(SICK_DB_UPDATED);

    if (dbSickWasUpdated !== 'true') {
      const dismissedExposures = await AsyncStorage.getItem(DISMISSED_EXPOSURES) || '[]';

      await dbSick.migrateTable();
      await AsyncStorage.setItem(SICK_DB_UPDATED, 'true');
      const validExposure = await AsyncStorage.getItem(VALID_EXPOSURE);

      if (validExposure) {
        const parsedValidExposure = JSON.parse(validExposure);

        if (parsedValidExposure) {
          const { exposure } = parsedValidExposure;

          exposure.properties.wasThere = true;
          exposure.properties.OBJECTID = exposure.properties.Key_Field;

          await dbSick.upgradeSickRecord(true, [exposure.properties.OBJECTID]);

          const parsedDismissedExposures: number[] = JSON.parse(dismissedExposures);

          // Set ensures no OBJECTID or BLETimestamp duplicates
          const dismissedExposureSet = new Set(parsedDismissedExposures);

          dismissedExposureSet.add(exposure.properties.OBJECTID);

          await AsyncStorage.setItem(DISMISSED_EXPOSURES, JSON.stringify([...dismissedExposureSet]));
        }
      }

      if (dismissedExposures) {
        const parsedDismissedExposures: number[] = JSON.parse(dismissedExposures);
        await dbSick.upgradeSickRecord(false, parsedDismissedExposures);
      }
    }
  } catch (error) {
    onError({ error });
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1
  }
});

const mapStateToProps = (state: any) => {
  const {
    general: { showLoader, showWebview, showForceUpdate, shouldForce, usageType, showForceTerms, termsVersion, isOnboarding },
    locale: { isInitLocale, showChangeLanguage, strings, locale, isRTL, externalUrls }
  } = state;

  return { strings, showLoader, isInitLocale, showChangeLanguage, showWebview, locale, showForceUpdate, shouldForce, usageType, showForceTerms, isRTL, termsVersion, externalUrls, isOnboarding };
};

export default connect(mapStateToProps, {
  initLocale,
  toggleWebview,
  checkForceUpdate,
  setOnboardingRoutes
})(Loading);
