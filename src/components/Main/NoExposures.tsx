import React, { useEffect, useRef, useState, useMemo } from 'react';
import { View, StyleSheet, AppState, AppStateStatus } from 'react-native';
import moment from 'moment';
import LottieView from 'lottie-react-native';

import LocationHistoryInfo from './LocationHistoryInfo';
import { FadeInView, Text,Icon, TouchableOpacity } from '../common';
import { Strings } from '../../locale/LocaleData';
import { IS_SMALL_SCREEN, MAIN_COLOR, PADDING_BOTTOM, SCREEN_WIDTH, BASIC_SHADOW_STYLES } from '../../constants/Constants';

interface Props {
  isRTL: boolean,
  firstPoint?: number,
  strings: Strings,
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
  }: Props
) => {
  
  const appState = useRef<AppStateStatus>('active');
  const [now, setNow] = useState(moment().valueOf());
  const { FPDate, nowHour} = useMemo(() => ({
    FPDate : moment(firstPoint).format('D.M.YY'),
    nowHour : moment(now).format('HH:mm')
  }), [firstPoint,now])

  // redundant ScanHome calls it
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

  return (
    <FadeInView style={styles.container}>
      <View style={{ alignItems: 'center', paddingHorizontal: IS_SMALL_SCREEN ? 15 : 40 }}>
        <LottieView
          style={styles.lottie}
          source={require('../../assets/lottie/magen logo.json')}
          resizeMode="cover"
          autoPlay
          loop
        />

        <Text bold style={{fontSize: 17, marginBottom: 20}}>אפליקציית המגן פועלת כל הזמן</Text>
        <Text bold style={{fontSize: 30}}>לא נמצאו</Text>
        <Text bold style={{fontSize: 30}}>נקודות חפיפה</Text>
      </View>
      <View style={styles.bottomCard}>

        <Text  style={{fontSize: 14, marginBottom: 10, }}>נכון לתאריך:</Text>
        <View style={{justifyContent: 'center', alignItems: 'center',flexDirection: 'row'}}>
            <Icon source={require('../../assets/main/moreInfo.png')} width={15} customStyles={{marginRight: 6}}/>
            <Text >
              <Text bold style={{fontSize: 15,}}>{FPDate}</Text>
              <Text style={{fontSize: 13,}}> בשעה </Text>
              <Text bold style={{fontSize: 15,}}>{nowHour}</Text>
            </Text>
        </View>
      </View>
    </FadeInView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: PADDING_BOTTOM(58)
  },
  lottie: {
    width: SCREEN_WIDTH * (IS_SMALL_SCREEN ? 0.25 : 0.45),
    height: SCREEN_WIDTH * (IS_SMALL_SCREEN ? 0.25 : 0.45),
    marginBottom: IS_SMALL_SCREEN ? 10 : 25
  },
  bottomCard: {
    width: SCREEN_WIDTH * (IS_SMALL_SCREEN ? 0.76 : 0.82),
    paddingVertical: 22, 
    borderRadius: 13,
    backgroundColor: '#FDFDFD',
    ...BASIC_SHADOW_STYLES
  }
});

export default NoExposures;
