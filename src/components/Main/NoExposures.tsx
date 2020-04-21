import React, { useEffect, useRef, useState, useMemo } from 'react';
import { View, StyleSheet, AppState, AppStateStatus } from 'react-native';
import moment from 'moment';
import LottieView from 'lottie-react-native';

import LocationHistoryInfo from './LocationHistoryInfo';
import { FadeInView, Text, Icon, TouchableOpacity } from '../common';
import { Strings } from '../../locale/LocaleData';
import { IS_SMALL_SCREEN, HIT_SLOP, PADDING_BOTTOM, SCREEN_WIDTH } from '../../constants/Constants';
import InfoModal, { InfoModalTypes } from './InfoModal';

interface NoExposuresProps {
  isRTL: boolean,
  firstPoint?: number,
  strings: Strings,
}

const NoExposures = (
  {
    isRTL,
    firstPoint,
    strings,
  }: NoExposuresProps
) => {
  const appState = useRef<AppStateStatus>('active');
  const modalRef = useRef<InfoModalTypes>(null);
  const [now, setNow] = useState(moment().valueOf());
  const { FPDate, nowHour } = useMemo(() => ({
    FPDate: moment(firstPoint).format('D.M.YY'),
    nowHour: moment(now).format('HH:mm')
  }), [firstPoint, now]);

  const {
    scanHome: {
      noExposures: {
        bannerTextPt1,
        bannerTextPt2,
        workAllTheTime,
        card: {
          title,
          atHour
        }
      }
    }
  } = strings;

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
    <>
      <FadeInView style={styles.fadeContainer}>
        <View style={styles.container}>
          <LottieView
            style={styles.lottie}
            source={require('../../assets/lottie/magen logo.json')}
            resizeMode="cover"
            autoPlay
            loop
          />

          <Text bold style={styles.workAllTimeTxt}>{workAllTheTime}</Text>
          <Text bold style={styles.bannerText}>{bannerTextPt1}</Text>
          <Text bold style={styles.bannerText}>{bannerTextPt2}</Text>
        </View>
        <View style={styles.bottomCard}>

          <Text style={styles.cardHeaderText}>{title}</Text>
          <View style={styles.cardBody}>
            <TouchableOpacity
              onPress={modalRef?.current?.toggleModal}
              hitSlop={HIT_SLOP}
            >
              <Icon
                width={15}
                source={require('../../assets/main/moreInfoBig.png')}
                customStyles={styles.infoIcon}
              />
            </TouchableOpacity>
            <Text>
              <Text bold style={styles.toTimeDate}>{FPDate}</Text>
              <Text style={styles.toTimeText}>{` ${atHour.trim()} `}</Text>
              <Text bold style={styles.toTimeDate}>{nowHour}</Text>
            </Text>
          </View>
        </View>
      </FadeInView>
      <InfoModal strings={strings} ref={modalRef} />
    </>
  );
};

const styles = StyleSheet.create({
  fadeContainer: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: PADDING_BOTTOM(58)
  },
  container: {
    alignItems: 'center',
    paddingHorizontal: IS_SMALL_SCREEN ? 15 : 40
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
    shadowColor: '#084473',
    shadowOffset: { width: 0, height: 9 },
    shadowOpacity: 0.1,
    shadowRadius: 9,
    elevation: 5,
  },
  cardHeaderText: {
    fontSize: 14,
    marginBottom: 10,
  },
  cardBody: {
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row'
  },
  infoIcon: {
    marginRight: 6
  },
  bannerText: {
    fontSize: 30
  },
  workAllTimeTxt: {
    fontSize: 17,
    marginBottom: 20
  },
  toTimeDate: {
    fontSize: 15
  },
  toTimeText: {
    fontSize: 13
  }
});

export default NoExposures;
