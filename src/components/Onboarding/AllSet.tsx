import React, { useEffect } from 'react';
import { View, StyleSheet, BackHandler } from 'react-native';
import { connect } from 'react-redux';
import LottieView from 'lottie-react-native';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-community/async-storage';
import { Text } from '../common';
import { scheduleTask } from '../../services/BackgroundService';
import { startForegroundTimer } from '../../services/Tracker';
import { onError } from '../../services/ErrorService';
import { startSampling } from '../../services/SampleService';
import { SCREEN_WIDTH, IS_FIRST_TIME } from '../../constants/Constants';

interface Props {
  navigation: any,
  locale: 'he'|'en'|'ar'|'am'|'ru'|'fr',
  strings: any
}

const AllSet = ({ navigation, strings: { allSet: { allGood } }, locale }: Props) => {
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
      await AsyncStorage.setItem(IS_FIRST_TIME, 'true');

      startForegroundTimer();
      await startSampling(locale);
      await scheduleTask();

      navigation.replace('ScanHome');
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
    locale: { strings, locale }
  } = state;

  return { strings, locale };
};

export default connect(mapStateToProps, null)(AllSet);
