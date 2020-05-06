import React from 'react';
import { View, StyleSheet, Linking, ScrollView } from 'react-native';
import moment from 'moment';
import { Exposure } from '../../types';
import { FadeInView, Icon, Text, TouchableOpacity } from '../common';
import { ExternalUrls, Languages, Strings } from '../../locale/LocaleData';
import {
  BASIC_SHADOW_STYLES,
  IS_SMALL_SCREEN,
  MAIN_COLOR,
  PADDING_BOTTOM,
  SCREEN_WIDTH
} from '../../constants/Constants';

interface Props {
  isRTL: boolean,
  strings: Strings,
  locale: string,
  languages: Languages,
  externalUrls: ExternalUrls,
  exposure: Exposure,
  removeValidExposure(): void
}

const ExposureInstructions = (
  {
    isRTL,
    locale,
    languages,
    externalUrls,
    strings: {
      scanHome: { inDate, fromHour },
      exposureInstructions: { title, weUnderstand, wrong, keepSafe, goIntoIsolation, reportIsolation, allInstructions, reportSite }
    },
    exposure: { properties: { Place, fromTime } },
    removeValidExposure
  }: Props
) => {
  const relevantLocale: string = Object.keys(languages.short).includes(locale) ? locale : 'he';

  const furtherInstructions = externalUrls.furtherInstructions[relevantLocale];
  const reportForm = externalUrls.reportForm[relevantLocale];

  const renderActionButton = (icon: number, text: string, buttonText: string, action: () => void) => (
    <View style={[styles.actionButtonContainer, IS_SMALL_SCREEN && { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
      <Icon source={icon} width={22} height={35} />

      <Text style={styles.actionText}>{text}</Text>

      <TouchableOpacity style={styles.button} onPress={action}>
        <Text style={styles.buttonText} bold>{buttonText}</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <FadeInView style={{ flex: 1 }}>
      <ScrollView
        bounces={false}
        contentContainerStyle={styles.subContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ flex: 1, alignItems: 'center' }}>
          <Text style={styles.title} bold>{title}</Text>

          <Text style={{ lineHeight: 22, marginBottom: 15, paddingHorizontal: 10 }}>
            {`${weUnderstand}${Place} ${inDate} ${moment(fromTime).format('DD.MM.YY')} ${fromHour} ${moment(fromTime).format('HH:mm')}?`}
          </Text>

          <TouchableOpacity style={{ marginBottom: IS_SMALL_SCREEN ? 30 : 50 }} onPress={removeValidExposure}>
            <Text style={{ fontSize: 14 }}>{wrong}</Text>
            <View style={styles.bottomBorder} />
          </TouchableOpacity>
        </View>

        <Text style={{ marginBottom: 25 }} bold>{keepSafe}</Text>
    <View style={!IS_SMALL_SCREEN  && {width: SCREEN_WIDTH - 23*2, flexDirection :'row', flexWrap: 'wrap', justifyContent: 'space-between',}}>

        {renderActionButton(require('../../assets/main/isolation.png'), goIntoIsolation, allInstructions, () => Linking.openURL(furtherInstructions))}
        {renderActionButton(require('../../assets/main/report.png'), reportIsolation, reportSite, () => Linking.openURL(reportForm))}
    </View>
      </ScrollView>
    </FadeInView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-around',
    alignItems: 'center'
  },
  subContainer: {
    paddingHorizontal: 30,
    alignItems: 'center',
    paddingTop: IS_SMALL_SCREEN ? 25 : 40,
    paddingBottom: PADDING_BOTTOM(10),
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
    width: 82,
    // height: 32,
    padding: 2,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 6,
    backgroundColor: MAIN_COLOR,
    
  },
  actionText: {
    flex: 1,
    lineHeight: 16,
    fontSize: IS_SMALL_SCREEN ? 14 : 16,
    paddingHorizontal: 10,
    marginBottom: IS_SMALL_SCREEN ? 0 : 23,
    marginTop: IS_SMALL_SCREEN ? 0 : 13
  },
  buttonText: {
    fontSize: IS_SMALL_SCREEN ? 12 : 14,
    color: '#fff'
  }
});

export default ExposureInstructions;
