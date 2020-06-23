import React, { useEffect, useRef, useState, useMemo, useCallback, FunctionComponent } from 'react';
import { View, StyleSheet, AppState, AppStateStatus, Linking, Button, Platform } from 'react-native';
import moment from 'moment';
import BTManager from 'react-native-bluetooth-state-manager';
import LottieView from 'lottie-react-native';
import { ScrollView } from 'react-native-gesture-handler';
import InfoBubble from './InfoBubble';
import InfoModal from './InfoModal';
import { FadeInView, Text, Icon, TouchableOpacity } from '../common';
import { Strings, Languages, ExternalUrls } from '../../locale/LocaleData';
import { IS_SMALL_SCREEN, HIT_SLOP, PADDING_BOTTOM, SCREEN_WIDTH, IS_IOS } from '../../constants/Constants';


interface NoExposuresProps {
  isRTL: boolean,
  firstPoint?: number,
  strings: Strings,
  hideLocationHistory: boolean,
  locale: string,
  languages: Languages,
  enableBle: boolean | undefined,
  externalUrls: ExternalUrls,
  exposureState: 'pristine' | 'notRelevant' | 'relevant',
  showBleInfo: boolean,
  goToLocationHistory(): void,
  goToBluetoothPermission(): void
}

type BTState = 'PoweredOff' | 'PoweredOn'

interface BluetoothBubbleProps {
  isRTL: boolean,
  info: string,
  moreInfo: string
}

const BluetoothBubble = (props: BluetoothBubbleProps) => {
  const [show, setShow] = useState(false);
  useEffect(() => {
    BTManager.initBLEStateManager();
    BTManager.onStateChange((btState: BTState) => {
      setShow(btState === 'PoweredOff');
    }, true);
  }, []);

  if (show) return <InfoBubble {...props} onPress={() => { IS_IOS ? Linking.openURL('App-Prefs:root=BLUETOOTH') : BTManager.enable(); }} />;
  return null;
};

const NoExposures: FunctionComponent<NoExposuresProps> = ({ exposureState, languages, locale, externalUrls, isRTL, firstPoint, strings, hideLocationHistory, enableBle, showBleInfo, goToLocationHistory, goToBluetoothPermission }) => {
  const appState = useRef<AppStateStatus>('active');
  const [showModal, setModalVisibility] = useState(false);

  const [now, setNow] = useState(moment().valueOf());
  const FPDate = useMemo(() => moment(firstPoint).format('D.M.YY'), [firstPoint]);

  const { nowDate, nowHour } = useMemo(() => ({
    nowDate: moment(now).format('D.M.YY'),
    nowHour: moment(now).format('HH:mm')
  }), [now]);

  const { scanHome: { noExposures: { bannerText, bannerTextPristine, workAllTheTime, instructionLinkUpper, instructionLinkLower, bluetoothServiceOff, turnBluetoothOn, canIdentifyWithBluetooth, moreInformation, card: { title, atHour } } }, locationHistory: { info, moreInfo } } = strings;

  // redundant, ScanHome calls it
  useEffect(() => {
    AppState.addEventListener('change', onStateChange);

    return () => {
      AppState.removeEventListener('change', onStateChange);
    };
  }, []);

  const RelevantCard = useMemo(() => {
    if (exposureState !== 'relevant') return null;

    const relevantLocale: string = Object.keys(languages.short).includes(locale) ? locale : 'he';

    const furtherInstructions = externalUrls.furtherInstructions[relevantLocale];

    return (
      <TouchableOpacity style={{ flexDirection: isRTL ? 'row' : 'row-reverse', alignContent: 'center' }} onPress={() => Linking.openURL(furtherInstructions)}>
        <View style={{ alignContent: 'flex-end' }}>
          <Text style={{ textAlign: isRTL ? 'right' : 'left', fontSize: IS_SMALL_SCREEN ? 14 : 16 }}>{instructionLinkUpper}</Text>
          <Text bold style={{ textAlign: isRTL ? 'right' : 'left', fontSize: IS_SMALL_SCREEN ? 14 : 16 }}>{instructionLinkLower}</Text>
        </View>
        <Icon
          width={15}
          height={IS_SMALL_SCREEN ? 25 : 30}
          source={require('../../assets/main/isolation.png')}
          customStyles={isRTL ? { marginLeft: 10 } : { marginRight: 10 }}
        />
      </TouchableOpacity>
    );
  }, [exposureState, strings]);

  const onStateChange = async (state: AppStateStatus) => {
    if (state === 'active' && appState.current !== 'active') {
      setNow(moment().valueOf());
    }
    appState.current = state;
  };

  const LocationHistoryInfo = () => {
    if (hideLocationHistory) return null;
    return (<InfoBubble isRTL={isRTL} info={info} moreInfo={moreInfo} onPress={goToLocationHistory} />);
  };

  const EnableBluetooth = () => {
    if (enableBle !== null) return null;
    return (
      <InfoBubble
        isRTL={isRTL}
        info={canIdentifyWithBluetooth}
        moreInfo={moreInformation}
        onPress={goToBluetoothPermission}
      />
    );
  };

  return (
    <>
      <FadeInView style={styles.fadeContainer}>
        <ScrollView bounces={false} contentContainerStyle={{ paddingBottom: PADDING_BOTTOM(10), flex: 1 }} showsVerticalScrollIndicator={false}>
          <View style={styles.container}>
            <LocationHistoryInfo />
            <EnableBluetooth />
            {enableBle && (
            <BluetoothBubble
              isRTL={isRTL}
              info={bluetoothServiceOff}
              moreInfo={turnBluetoothOn}
            />
            )}
            <LottieView
              style={styles.lottie}
              source={require('../../assets/lottie/magen logo.json')}
              resizeMode="cover"
              autoPlay
              loop
            />

            <Text bold style={styles.workAllTimeTxt}>{workAllTheTime}</Text>
            <Text bold style={styles.bannerText}>{exposureState === 'pristine' ? bannerTextPristine : bannerText}</Text>
          </View>
          <View style={{ flexGrow: 1, alignItems: 'center', justifyContent: 'space-around' }}>

            <View style={styles.bottomCard}>

              <Text style={styles.cardHeaderText}>{title}</Text>
              <View style={styles.cardBody}>
                <TouchableOpacity
                  onPress={() => setModalVisibility(true)}
                  hitSlop={HIT_SLOP}
                >
                  <Icon
                    width={15}
                    source={require('../../assets/main/moreInfoBig.png')}
                    customStyles={styles.infoIcon}
                  />
                </TouchableOpacity>
                <Text>
                  <Text bold style={styles.toTimeDate}>{nowDate}</Text>
                  <Text style={styles.toTimeText}>{` ${atHour.trim()} `}</Text>
                  <Text bold style={styles.toTimeDate}>{nowHour}</Text>
                </Text>
              </View>

            </View>
            {RelevantCard}
          </View>
        </ScrollView>
      </FadeInView>

      <InfoModal
        strings={strings}
        showModal={showModal}
        firstPointDate={FPDate}
        closeModal={() => setModalVisibility(false)}
      />
    </>
  );
};

const styles = StyleSheet.create({
  fadeContainer: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingBottom: PADDING_BOTTOM(10)
  },
  container: {
    
    alignItems: 'center',
    paddingHorizontal: IS_SMALL_SCREEN ? 15 : 30
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
    fontSize: IS_SMALL_SCREEN ? 22 : 26
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

export default React.memo(NoExposures);
