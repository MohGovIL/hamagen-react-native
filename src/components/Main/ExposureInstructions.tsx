import React from 'react';
import { View, StyleSheet, Linking, ScrollView } from 'react-native';
import moment from 'moment';
import { Exposure } from '../../types';
import { FadeInView, Icon, Text, TouchableOpacity } from '../common';
import config from '../../config/config';
import { BASIC_SHADOW_STYLES, IS_SMALL_SCREEN, MAIN_COLOR, SCREEN_WIDTH } from '../../constants/Constants';

interface Props {
  isRTL: boolean,
  strings: any,
  locale: 'he'|'en'|'ar'|'am'|'ru',
  exposure: Exposure,
  removeValidExposure(): void
}

const ExposureInstructions = (
  {
    isRTL,
    locale,
    strings: {
      scanHome: { inDate, fromHour, toHour },
      exposureInstructions: { title, weUnderstand, wrong, keepSafe, goIntoIsolation, reportIsolation, allInstructions, reportSite }
    },
    exposure: { properties: { Place, fromTime, toTime } },
    removeValidExposure
  }: Props
) => {
  const relevantLocale: 'he'|'en'|'ar'|'am'|'ru' = ['he', 'en', 'ar', 'am', 'ru'].includes(locale) ? locale : 'he';

  const furtherInstructions = config().furtherInstructions[relevantLocale];
  const reportForm = config().reportForm[relevantLocale];

  const renderActionButton = (icon: number, text: string, buttonText: string, action: () => void) => (
    <View style={[styles.actionButtonContainer, !IS_SMALL_SCREEN && { height: 230 }]}>
      <View style={{ alignItems: 'center', paddingHorizontal: 15 }}>
        <Icon source={icon} width={22} height={35} customStyles={{ marginBottom: 15 }} />
        <Text style={[{ lineHeight: 17, marginBottom: 20 }, locale === 'en' && text === goIntoIsolation && { fontSize: 13 }]}>{text}</Text>
      </View>

      <TouchableOpacity style={styles.button} onPress={action}>
        <Text style={styles.buttonText} bold>{buttonText}</Text>
      </TouchableOpacity>
    </View>
  );

  const ContentContainer = IS_SMALL_SCREEN ? ScrollView : View;

  return (
    <FadeInView style={{ flex: 1 }}>
      <ContentContainer style={!IS_SMALL_SCREEN ? styles.container : {}} scrollEnabled showsVerticalScrollIndicator={false}>
        <View style={{ alignItems: 'center', paddingHorizontal: 30 }}>
          <Text style={styles.title} bold>{title}</Text>

          <Text style={{ lineHeight: 22, marginBottom: 15 }}>
            {`${weUnderstand}${Place} ${inDate} ${moment.utc(fromTime).format('DD.MM.YY')} ${fromHour} ${moment.utc(fromTime).format('HH:mm')} ${toHour} ${moment.utc(toTime).format('HH:mm')}`}
          </Text>

          <TouchableOpacity style={{ marginBottom: IS_SMALL_SCREEN ? 20 : 0 }} onPress={removeValidExposure}>
            <Text style={{ fontSize: 14 }}>{wrong}</Text>
            <View style={styles.bottomBorder} />
          </TouchableOpacity>
        </View>

        <View style={{ alignItems: 'center', paddingHorizontal: 25 }}>
          <Text style={{ marginBottom: 25 }} bold>{keepSafe}</Text>

          <View style={[styles.actionButtonsWrapper, { flexDirection: isRTL ? 'row-reverse' : 'row' }, IS_SMALL_SCREEN && { marginBottom: 100 }]}>
            {renderActionButton(require('../../assets/main/isolation.png'), goIntoIsolation, allInstructions, () => Linking.openURL(furtherInstructions))}
            {renderActionButton(require('../../assets/main/report.png'), reportIsolation, reportSite, () => Linking.openURL(reportForm))}
          </View>
        </View>
      </ContentContainer>
    </FadeInView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-around',
    alignItems: 'center'
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
  actionButtonsWrapper: {
    width: SCREEN_WIDTH - 50,
    justifyContent: 'space-between'
  },
  actionButtonContainer: {
    ...BASIC_SHADOW_STYLES,
    width: (SCREEN_WIDTH - 60) / 2,
    paddingVertical: 20,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  button: {
    width: ((SCREEN_WIDTH - 60) / 2) - 50,
    height: 35,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 7,
    backgroundColor: MAIN_COLOR
  },
  buttonText: {
    fontSize: 14,
    color: '#fff'
  }
});

export default ExposureInstructions;
