import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, AppState, AppStateStatus } from 'react-native';
import moment from 'moment';
import LottieView from 'lottie-react-native';
import LocationHistoryInfo from './LocationHistoryInfo';
import { FadeInView, Text, TouchableOpacity } from '../common';
import { IS_SMALL_SCREEN, MAIN_COLOR, PADDING_BOTTOM, SCREEN_WIDTH, USAGE_PRIVACY } from '../../constants/Constants';

interface Props {
  isRTL: boolean,
  firstPoint?: number,
  strings: any,
  hideLocationHistory: boolean,
  goToLocationHistory(): void,
  toggleWebview(isShow: boolean, usageType: string): void
}

const NoExposures = (
  {
    isRTL,
    firstPoint,
    strings: {
      general: { additionalInfo },
      scanHome: { noExposure, accordingToData, from, at, until, notFound, recommendation },
      locationHistory: { info, moreInfo }
    },
    hideLocationHistory,
    toggleWebview,
    goToLocationHistory
  }: Props
) => {
  const appState = useRef<AppStateStatus>('active');
  const [now, setNow] = useState(moment().valueOf());

  useEffect(() => {
    AppState.addEventListener('change', onStateChange);

    return () => {
      AppState.removeEventListener('change', onStateChange);
    };
  }, []);

  const onStateChange = async (state: AppStateStatus) => {
    if (state === 'active' && appState.current !== 'active') {
      setNow(moment().valueOf());
    }

    appState.current = state;
  };

  const descriptions = () => {
    const FPDate = moment(firstPoint).format('DD.MM.YY');
    const FPHour = moment(firstPoint).format('HH:mm');
    const nowHour = moment(now).format('HH:mm');

    if (firstPoint) {
      return `${accordingToData} ${from} ${FPDate} ${at} ${FPHour} ${until} ${at} ${nowHour} ${notFound}`;
    }

    return noExposure;
  };

  return (
    <FadeInView style={styles.container}>
      {!hideLocationHistory && <LocationHistoryInfo isRTL={isRTL} info={info} moreInfo={moreInfo} onPress={goToLocationHistory} />}

      <View style={{ alignItems: 'center' }}>
        <LottieView
          style={styles.lottie}
          source={require('../../assets/lottie/magen logo.json')}
          resizeMode="cover"
          autoPlay
          loop={false}
        />

        <Text style={styles.text} bold>{descriptions()}</Text>
      </View>

      <Text style={[styles.text, { lineHeight: 22 }]}>{recommendation}</Text>

      <TouchableOpacity onPress={() => toggleWebview(true, USAGE_PRIVACY)}>
        <Text style={{ fontSize: 14 }}>{additionalInfo}</Text>
        <View style={styles.bottomBorder} />
      </TouchableOpacity>
    </FadeInView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 25,
    paddingBottom: PADDING_BOTTOM(50)
  },
  lottie: {
    width: SCREEN_WIDTH * (IS_SMALL_SCREEN ? 0.3 : 0.5),
    height: SCREEN_WIDTH * (IS_SMALL_SCREEN ? 0.3 : 0.5),
    marginBottom: IS_SMALL_SCREEN ? 10 : 25
  },
  text: {
    width: 220
  },
  bottomBorder: {
    alignSelf: 'stretch',
    height: 2,
    borderRadius: 1,
    backgroundColor: MAIN_COLOR
  }
});

export default NoExposures;
