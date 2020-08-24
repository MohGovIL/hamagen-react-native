import LottieView from 'lottie-react-native';
import moment from 'moment';
import React, { FunctionComponent, useEffect, useMemo, useRef, useState } from 'react';
import { AppState, AppStateStatus, Linking, ScrollView, StyleSheet, View } from 'react-native';
import BTManager from 'react-native-bluetooth-state-manager';
import { HIT_SLOP, IS_IOS, IS_SMALL_SCREEN, PADDING_BOTTOM, SCREEN_WIDTH } from '../../constants/Constants';
import { ExternalUrls, Languages, Strings } from '../../locale/LocaleData';
import { toggleBLEService } from '../../services/BLEService';
import { FadeInView, Icon, Text, TouchableOpacity } from '../common';
import InfoBubble from './InfoBubble';
import InfoModal from './Modals/InfoModal';

interface NoExposuresProps {
  isRTL: boolean
  firstPoint?: number
  strings: Strings
  hideLocationHistory: boolean
  locale: string
  languages: Languages
  enableBle: string | null
  externalUrls: ExternalUrls
  exposureState: 'pristine' | 'notRelevant' | 'relevant'
  showBleInfo: boolean
  batteryDisabled: boolean
  goToLocationHistory(): void
  goToBluetoothPermission(): void
  goToBatteryPermission(): void
}

type BTState = 'PoweredOff' | 'PoweredOn'

interface BluetoothBubbleProps {
  title: string
  isRTL: boolean
  info: string
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

  if (show) { return <InfoBubble {...props} onPress={() => { IS_IOS ? Linking.openURL('App-Prefs:root=BLUETOOTH') : BTManager.enable(); }} />; }
  return null;
};

const NoExposures: FunctionComponent<NoExposuresProps> = ({ exposureState, languages, locale, externalUrls, isRTL, firstPoint, strings, hideLocationHistory, enableBle, batteryDisabled, goToLocationHistory, goToBluetoothPermission, goToBatteryPermission }) => {
  const appState = useRef<AppStateStatus>('active');
  const [showModal, setModalVisibility] = useState(false);

  const [now, setNow] = useState(moment().valueOf());
  const FPDate = useMemo(() => moment(firstPoint).format('D.M.YY'), [firstPoint]);

  const { nowDate, nowHour } = useMemo(() => ({
    nowDate: moment(now).format('D.M.YY'),
    nowHour: moment(now).format('HH:mm')
  }), [now]);

  const { scanHome: { noExposures: { bannerText, bannerTextPristine, workAllTheTime, instructionLinkUpper, instructionLinkLower, bluetoothServiceOff, turnBluetoothOn, canIdentifyWithBluetooth, bluetoothServiceOffTitle, BLESdkOffTitle, BLESdkOff, turnBLESdkOn, moreInformation, card: { title, atHour } } }, locationHistory: { info, moreInfo } } = strings;

  // redundant, ScanHome calls it
  useEffect(() => {
    AppState.addEventListener('change', onStateChange);


    return () => {
      AppState.removeEventListener('change', onStateChange);
    };

  }, []);

  useEffect(() => {
    if (batteryDisabled === null) {
      goToBatteryPermission()
    }
  }, [batteryDisabled])

  const RelevantCard = useMemo(() => {
    if (exposureState !== 'relevant') { return null; }

    const relevantLocale: string = Object.keys(languages.short).includes(locale) ? locale : 'he';

    const furtherInstructions = externalUrls.furtherInstructions[relevantLocale];

    return (
      <TouchableOpacity style={{ flexDirection: isRTL ? 'row' : 'row-reverse', alignContent: 'center', marginTop: IS_SMALL_SCREEN ? 15 : 20 }} onPress={() => Linking.openURL(furtherInstructions)}>
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

  const LocationHistoryInfo = useMemo(() => {
    if (hideLocationHistory) { return null; }
    return (<InfoBubble isRTL={isRTL} info={info} moreInfo={moreInfo} onPress={goToLocationHistory} />);
  }, [hideLocationHistory, locale])

  const EnableBluetooth = useMemo(() => {
    switch (enableBle) {
      case 'false':
        return (<InfoBubble
          isRTL={isRTL}
          title={BLESdkOffTitle}
          info={BLESdkOff}
          moreInfo={turnBLESdkOn}
          onPress={() => toggleBLEService(true)}
        />)
      case 'true':
        return (<BluetoothBubble
          isRTL={isRTL}
          title={bluetoothServiceOffTitle}
          info={bluetoothServiceOff}
          moreInfo={turnBluetoothOn}
        />)
      case null:
        return (
          <InfoBubble
            isRTL={isRTL}
            info={canIdentifyWithBluetooth}
            moreInfo={moreInformation}
            onPress={goToBluetoothPermission}
          />
        )
      case 'blocked':
      default: 
      return null

    }

  },[enableBle, locale])

  return (
    <>
      <FadeInView style={styles.fadeContainer}>
        <ScrollView
          bounces={false}
          contentContainerStyle={{ paddingBottom: PADDING_BOTTOM(10), flexGrow: 1 }}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.container}>
            {LocationHistoryInfo}
            {EnableBluetooth}
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
