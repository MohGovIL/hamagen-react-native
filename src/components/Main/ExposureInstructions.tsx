import React, { useMemo, useEffect } from 'react';
import { View, StyleSheet, Linking, ScrollView, BackHandler } from 'react-native';
import moment from 'moment';
import { useSelector } from 'react-redux';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import SplashScreen from 'react-native-splash-screen';
import AsyncStorage from '@react-native-community/async-storage';
import {
  BASIC_SHADOW_STYLES,
  IS_SMALL_SCREEN,
  MAIN_COLOR,
  PADDING_BOTTOM,
  SCREEN_WIDTH,
  PADDING_TOP,
  HIT_SLOP,
  INIT_ROUTE_NAME
} from '../../constants/Constants';
import { ExternalUrls, Languages, Strings } from '../../locale/LocaleData';
import { FadeInView, Icon, Text, TouchableOpacity } from '../common';
import { Exposure, Store, LocaleReducer } from '../../types';

interface Props {
  navigation: StackNavigationProp<any>,
  route: RouteProp<any>
}

// exposure: { properties: { Place, fromTime } },
const ExposureInstructions = ({ navigation, route }: Props) => {
  const {
    isRTL,
    locale,
    languages,
    externalUrls,
    strings: {
      scanHome: { atPlace },
      exposureInstructions: { title, subTitle, updateTitle, updateSubTitle, themInstructions, editBtn, finishBtn, goIntoIsolation, reportIsolation, allInstructions, reportSite }
    },
  } = useSelector<Store, LocaleReducer>(state => state.locale);

  const exposures = useSelector<Store, Exposure[]>(state => state.exposures.pastExposures.filter((exposure: Exposure) => exposure.properties.wasThere));

  useEffect(() => {
    SplashScreen.hide();
    // if edit button need to be shown then Exposure Instructions don't need to persists
    AsyncStorage.setItem(INIT_ROUTE_NAME, 'ExposureInstructions')
    BackHandler.addEventListener('hardwareBackPress', () => true);
    return () =>
      BackHandler.removeEventListener('hardwareBackPress', () => true);
  }, [])

  const [furtherInstructions, reportForm] = useMemo(() => {
    const relevantLocale: string = Object.keys(languages.short).includes(locale) ? locale : 'he';

    return [
      externalUrls.furtherInstructions[relevantLocale],
      externalUrls.reportForm[relevantLocale]
    ];
  }, [languages.short, locale]);

  const ExposureList = useMemo(() => exposures.map((exposure: Exposure) => (
    <Text style={{ fontSize: IS_SMALL_SCREEN ? 14 : 16, marginVertical: IS_SMALL_SCREEN ? 5 : 10 }} key={exposure.properties.OBJECTID}>
      <Text bold>• </Text>
      <Text>{`${atPlace}${exposure.properties.Place}`}</Text>
    </Text>
  )), [exposures, locale]);

  const renderActionButton = (icon: number, text: string, buttonText: string, action: () => void) => (
    <View style={[styles.actionButtonContainer, IS_SMALL_SCREEN ? styles.actionButtonContainerSmall : styles.actionButtonContainerBig, IS_SMALL_SCREEN && { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
      <Icon source={icon} width={22} height={35} />

      <Text style={styles.actionText}>{text}</Text>

      <TouchableOpacity style={styles.button} onPress={action}>
        <Text style={styles.buttonText} bold>{buttonText}</Text>
      </TouchableOpacity>
    </View>
  );

  const RenderHeader = useMemo(() => route.params?.update
    ? (
      <>
        <Icon source={require('../../assets/main/exposureRefresh.png')} width={86} customStyles={{ marginBottom: 15 }} />
        <Text style={styles.title} bold>{updateTitle}</Text>
        <Text style={{ marginBottom: 3 }}>{updateSubTitle}</Text>
      </>
    )
    : (
      <>
        <Text style={styles.title} bold>{title}</Text>
        <Text style={{ marginBottom: 3 }}>{subTitle}</Text>
        {ExposureList}
      </>
    ),

  [route.params?.update]);

  return (

    <ScrollView
      bounces={false}
      contentContainerStyle={styles.subContainer}
      showsVerticalScrollIndicator={false}
    >
      {route.params?.showEdit && (
      <TouchableOpacity
        hitSlop={HIT_SLOP}
        style={{
          alignContent: 'center',
          alignItems: 'center',
          position: 'absolute',
          top: PADDING_TOP(IS_SMALL_SCREEN ? 10 : 28),
          flexDirection: isRTL ? 'row' : 'row-reverse',
          [!isRTL ? 'right' : 'left']: IS_SMALL_SCREEN ? 10 : 25,
        }}
        onPress={navigation.goBack}
      >
        <Icon
          width={IS_SMALL_SCREEN ? 20 : 24}
          source={require('../../assets/main/back.png')}
          customStyles={{
            transform: [{ rotate: !isRTL ? '0deg' : '180deg' }]
          }}
        />
        <Text
          bold
          style={{
            fontSize: IS_SMALL_SCREEN ? 13 : 15,
            color: MAIN_COLOR,
            marginHorizontal: IS_SMALL_SCREEN ? 5 : 8
          }}
        >
          {editBtn}
        </Text>
      </TouchableOpacity>
)}


      <View style={{ justifyContent: 'flex-start', alignItems: 'center' }}>

        {RenderHeader}

      </View>
      <View style={{ justifyContent: 'space-between' }}>
        <Text style={{ marginBottom: IS_SMALL_SCREEN ? 12 : 25 }} bold>{themInstructions}</Text>
        <View style={!IS_SMALL_SCREEN && { width: SCREEN_WIDTH - (23 * 2), flexDirection: isRTL ? 'row-reverse' : 'row', flexWrap: 'wrap', justifyContent: 'space-between', }}>
          {renderActionButton(require('../../assets/main/isolation.png'), goIntoIsolation, allInstructions, () => Linking.openURL(furtherInstructions))}
          {renderActionButton(require('../../assets/main/report.png'), reportIsolation, reportSite, () => Linking.openURL(reportForm))}
        </View>
        <Text
          bold
          onPress={() => {
            AsyncStorage.removeItem(INIT_ROUTE_NAME);
            navigation.navigate('ScanHome');
            // navigation.reset({
            //   index: 0,
            //   routes: [{ name: "ScanHome" }]
            // })
          }}
          style={{
            color: MAIN_COLOR,
            marginTop: IS_SMALL_SCREEN ? 22 : 32,
            fontSize: IS_SMALL_SCREEN ? 14 : 16
          }}
        >
          {finishBtn}
        </Text>
      </View>
    </ScrollView>

  );
};

const styles = StyleSheet.create({
  subContainer: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 25,
    paddingTop: IS_SMALL_SCREEN ? PADDING_TOP(33) : PADDING_TOP(76),
    paddingBottom: PADDING_BOTTOM(41)
    // paddingVertical: PADDING_BOTTOM(76),
  },
  title: {
    fontSize: 22,
    marginBottom: 20
  },
  actionButtonContainer: {
    ...BASIC_SHADOW_STYLES,

    marginBottom: 12,

    borderRadius: 16,

    justifyContent: 'space-between',
    alignItems: 'center'
  },
  actionButtonContainerSmall: {
    width: SCREEN_WIDTH - 30,
    padding: 10,

  },
  actionButtonContainerBig: {
    width: (SCREEN_WIDTH / 2) - (23 + 5.5),
    paddingVertical: 15,
    paddingHorizontal: 23,
  },
  button: {
    flexGrow: 1,
    padding: 4,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 6,
    backgroundColor: MAIN_COLOR,

  },
  actionText: IS_SMALL_SCREEN ? {
    lineHeight: 16,
    fontSize: 14,
    flexShrink: 1,
    marginHorizontal: 10
  } : {
    lineHeight: 16,
    fontSize: 16,
    marginBottom: 23,
    marginTop: 13
  },
  buttonText: {
    fontSize: IS_SMALL_SCREEN ? 12 : 14,
    color: '#fff'
  }
});

export default ExposureInstructions;
