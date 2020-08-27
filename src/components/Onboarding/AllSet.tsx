import AsyncStorage from '@react-native-community/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import LottieView from 'lottie-react-native';
import React, { useEffect } from 'react';
import { BackHandler, StyleSheet, View } from 'react-native';
import { connect } from 'react-redux';
import { setOnboardingRoutes } from '../../actions/GeneralActions';
import { DID_CLUSTER_LOCATIONS, IS_FIRST_TIME, MENU_DOT_LAST_SEEN, SCREEN_WIDTH, SICK_DB_UPDATED, VERSION_BUILD } from '../../constants/Constants';
import { NotificationData, Strings } from '../../locale/LocaleData';
import { scheduleTask } from '../../services/BackgroundService';
import { onError } from '../../services/ErrorService';
import { startSampling } from '../../services/SampleService';
import { startForegroundTimer } from '../../services/Tracker';
import { Text } from '../common';

interface Props {
  navigation: StackNavigationProp<any, 'AllSet'>,
  locale: string,
  notificationData: NotificationData,
  strings: Strings,
  setOnboardingRoutes(state: boolean): void
}

const AllSet = ({ navigation, strings: { allSet: { allGood } }, locale, notificationData, setOnboardingRoutes }: Props) => {
  useEffect(() => {
    setTimeout(() => {
      onboardingDoneActions();
    }, 3000);
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      const onBackPress = () => {
        return true;
      };

      BackHandler.addEventListener('hardwareBackPress', onBackPress);

      return () => {
        BackHandler.removeEventListener('hardwareBackPress', onBackPress);
      };
    }, [])
  );

  const onboardingDoneActions = async () => {
    try {
      await AsyncStorage.multiSet([
        [IS_FIRST_TIME, 'true'],
        [DID_CLUSTER_LOCATIONS, 'true'],
        [SICK_DB_UPDATED, 'true'],
        [MENU_DOT_LAST_SEEN, VERSION_BUILD]
      ]);
      // TODO: figure out why replace crash android on first upload
      setOnboardingRoutes(false);

      await startForegroundTimer();
      await startSampling(locale, notificationData);
      await scheduleTask();
    } catch (error) {
      onError({ error });
    }
  };

  return (
    <View style={styles.container}>
      <LottieView
        style={styles.loader}
        source={require('../../assets/lottie/loader no mask.json')}
        resizeMode="cover"
        autoPlay
        loop
      />
      <Text style={styles.text} black>{allGood}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff'
  },
  loader: {
    width: SCREEN_WIDTH / 2,
    height: SCREEN_WIDTH / 2
  },
  text: {
    fontSize: 20,
    marginTop: 30
  }
});

const mapStateToProps = (state: any) => {
  const {
    locale: { strings, locale, notificationData }
  } = state;

  return { strings, locale, notificationData };
};

export default connect(mapStateToProps, { setOnboardingRoutes })(AllSet);
