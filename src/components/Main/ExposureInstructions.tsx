import React, { useMemo } from 'react';
import { View, StyleSheet, Linking, ScrollView } from 'react-native';
import moment from 'moment';
import { Exposure, Store, LocaleReducer } from '../../types';
import { FadeInView, Icon, Text, TouchableOpacity } from '../common';
import { ExternalUrls, Languages, Strings } from '../../locale/LocaleData';
import {
  BASIC_SHADOW_STYLES,
  IS_SMALL_SCREEN,
  MAIN_COLOR,
  PADDING_BOTTOM,
  SCREEN_WIDTH,
  PADDING_TOP,
  HIT_SLOP
} from '../../constants/Constants';
import { useSelector } from 'react-redux';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';

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
      exposureInstructions: { title, subTitle, themInstructions, editBtn, finishBtn, goIntoIsolation, reportIsolation, allInstructions, reportSite }
    },
  } = useSelector<Store, LocaleReducer>(state => state.locale)

  const exposures = useSelector<Store, Exposure[]>(state => state.exposures.exposures.filter((exposure: Exposure) => exposure.properties.wasThere))

  const [furtherInstructions, reportForm] = useMemo(() => {
    const relevantLocale: string = Object.keys(languages.short).includes(locale) ? locale : 'he'

    return [
      externalUrls.furtherInstructions[relevantLocale],
      externalUrls.reportForm[relevantLocale]
    ]
  }, [languages.short, locale])

  const ExposureList = useMemo(() => exposures.map((exposure: Exposure) => (
    <Text style={{ fontSize: IS_SMALL_SCREEN ? 14 : 16, marginVertical: IS_SMALL_SCREEN ? 5 : 10 }} key={exposure.properties.OBJECTID}>
      <Text bold>• </Text>
      <Text>{`${atPlace}${exposure.properties.Place}`}</Text>
    </Text>
  )
  ), [exposures, locale])

  const renderActionButton = (icon: number, text: string, buttonText: string, action: () => void) => (
    <View style={[styles.actionButtonContainer, IS_SMALL_SCREEN && { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
      <Icon source={icon} width={22} height={35} />

      <Text style={styles.actionText}>{text}</Text>

      <TouchableOpacity style={styles.button} onPress={action}>
        <Text style={styles.buttonText} bold>{buttonText}</Text>
      </TouchableOpacity>
    </View>
  );

  const RenderHeader = useMemo(() => 
    route.params?.update ?
      (
        <>
          <Icon source={require('../../assets/main/exposureRefresh.png')} width={86} customStyles={{marginBottom: 15}} />
          <Text style={styles.title} bold>תודה שעדכנת</Text>
          <Text style={{ marginBottom: 3 }}>ייתכן שהשינוייים שעשית משפיעים על ההתנהלות בהמשך</Text>
        </>
      ) :
      (<>
        <Text style={styles.title} bold>{title}</Text>
        <Text style={{ marginBottom: 3 }}>{subTitle}</Text>
        {ExposureList}
      </>
      )

  , [route.params?.update])

  return (

    <ScrollView
      bounces={false}
      contentContainerStyle={styles.subContainer}
      showsVerticalScrollIndicator={false}
    >
      {route.params?.showEdit && <TouchableOpacity
        hitSlop={HIT_SLOP}
        style={{
          flexDirection: isRTL ? 'row' : 'row-reverse',
          alignContent: 'center',
          alignItems: 'center',
          position: 'absolute',
          top: PADDING_TOP(28),
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
        >{editBtn}</Text>
      </TouchableOpacity>}


      <View style={{ justifyContent: 'flex-start',alignItems: 'center', flex: 1 }}  >

        {RenderHeader}

      </View>
      <View style={{ justifyContent: 'space-evenly', flex: 1 }} >
        <Text style={{ marginBottom: IS_SMALL_SCREEN ? 12 : 25 }} bold>{themInstructions}</Text>
        <View style={!IS_SMALL_SCREEN && { width: SCREEN_WIDTH - (23 * 2), flexDirection: isRTL ? 'row-reverse' : 'row', flexWrap: 'wrap', justifyContent: 'space-between', }}>
          {renderActionButton(require('../../assets/main/isolation.png'), goIntoIsolation, allInstructions, () => Linking.openURL(furtherInstructions))}
          {renderActionButton(require('../../assets/main/report.png'), reportIsolation, reportSite, () => Linking.openURL(reportForm))}
        </View>
        <Text
          bold
          onPress={navigation.popToTop}
          style={{
            color: MAIN_COLOR,
            marginTop: IS_SMALL_SCREEN ? 22 : 32,
            fontSize: IS_SMALL_SCREEN ? 14 : 16
          }}
        >{finishBtn}</Text>
      </View>
    </ScrollView>

  );
};

const styles = StyleSheet.create({
  subContainer: {
    flex: 1,
    paddingHorizontal: 30,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: IS_SMALL_SCREEN ? 25 : PADDING_TOP(76),
    paddingBottom: PADDING_BOTTOM(41)
    // paddingVertical: PADDING_BOTTOM(76),
  },
  title: {
    fontSize: 22,
    marginBottom: 20
  },
  bottomBorder: {
    alignSelf: 'stretch',
    height: 2,
    borderRadius: 1,
    backgroundColor: MAIN_COLOR
  },
  actionButtonContainer: {
    ...BASIC_SHADOW_STYLES,
    width: IS_SMALL_SCREEN ? SCREEN_WIDTH - 50 : (SCREEN_WIDTH / 2) - (23 + 5.5),
    justifyContent: 'space-between',
    paddingVertical: 15,
    paddingHorizontal: 23,
    borderRadius: 16,
    marginBottom: 12,
    alignItems: 'center'
  },
  button: {
    // width: 82,
    padding: 4,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 6,
    backgroundColor: MAIN_COLOR,

  },
  actionText: {

    lineHeight: 16,
    fontSize: IS_SMALL_SCREEN ? 14 : 16,
    // paddingHorizontal: 10,
    marginBottom: IS_SMALL_SCREEN ? 0 : 23,
    marginTop: IS_SMALL_SCREEN ? 0 : 13
  },
  buttonText: {
    fontSize: IS_SMALL_SCREEN ? 12 : 14,
    color: '#fff'
  }
});

export default ExposureInstructions;
