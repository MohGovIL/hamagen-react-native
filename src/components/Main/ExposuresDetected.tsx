import React, { useState, useCallback } from 'react';
import { View, StyleSheet, Animated, ScrollView } from 'react-native';
import moment from 'moment';
import { Region } from 'react-native-maps';
import { FadeInView, Icon, Text, TouchableOpacity } from '../common';
import { Strings } from '../../locale/LocaleData';
import { Exposure } from '../../types';
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
  exposures: Exposure[],
  onValidExposure(exposure: Exposure): void,
  dismissExposure(exposureId: number): void,
  showMapModal(region: Region): void
}

const ExposuresDetected = (
  {
    isRTL,
    strings: {
      scanHome: { inDate, fromHour, wereYouThere, wasNotMe, wasMe, suspectedExposure, events, possibleExposure, atPlace, showOnMap },
    },
    exposures,
    onValidExposure,
    dismissExposure,
    showMapModal
  }: Props
) => {
  const [anim] = useState(new Animated.Value(1));

  const scale = {
    transform: [{
      scale: anim.interpolate({ inputRange: [0, 1], outputRange: [0.01, 1] })
    }]
  };

  const onDismissExposure = () => {
    if (exposures.length === 1) {
      dismissExposure(exposures[0].properties.OBJECTID);
    } else {
      Animated.timing(anim, { toValue: 0, duration: 200, useNativeDriver: true }).start(() => {
        dismissExposure(exposures[0].properties.OBJECTID);
        setTimeout(() => Animated.timing(anim, { toValue: 1, duration: 200, useNativeDriver: true }).start(), 50);
      });
    }
  };

  const renderExposure = useCallback(({ properties: { Place, fromTime } }: Exposure) => (
    <Animated.View style={[styles.detailsContainer, scale]}>
      <Text style={{ fontSize: 13, marginBottom: 8 }}>{`1/${exposures.length}`}</Text>
      <Text style={{ fontSize: 14, marginBottom: 18 }}>{possibleExposure}</Text>
      <Text style={{ fontSize: 18, lineHeight: 25 }} bold>
        {`${atPlace}${Place} ${inDate} ${moment(fromTime).format('DD.MM.YY')} ${fromHour} ${moment(fromTime).format('HH:mm')}?`}
      </Text>
      <View style={{ marginTop: 12, paddingBottom: 3, borderBottomWidth: 1.5, borderColor: MAIN_COLOR }}>
        <Text style={{ fontSize: 14 }} onPress={() => showMapModal(exposures[0])}>{showOnMap}</Text>
      </View>
    </Animated.View>
  ), [exposures[0]]);

  const renderActionButton = (text: string, action: () => void) => (
    <TouchableOpacity onPress={action} style={styles.actionButton}>
      <Text bold style={styles.actionButtonText}>{text}</Text>
    </TouchableOpacity>
  );

  return (
    <FadeInView style={styles.container}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: 10 }}
        bounces={false}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 18 }}
      >
        <View style={{ alignItems: 'center' }}>
          <Icon source={require('../../assets/main/exposures.png')} width={IS_SMALL_SCREEN ? 66 : 99} height={IS_SMALL_SCREEN ? 40 : 59} customStyles={{ marginBottom: 33 }} />
          <Text style={styles.title} bold>{`${suspectedExposure} ${exposures.length} ${events}`}</Text>
        </View>

        {renderExposure(exposures[0])}

        <View />
      </ScrollView>

      <View style={styles.footer}>
        <Text style={{ marginBottom: 15 }}>{wereYouThere}</Text>

        <View style={[styles.actionButtonsWrapper, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
          {renderActionButton(wasMe, () => onValidExposure(exposures[0]))}
          {renderActionButton(wasNotMe, onDismissExposure)}
        </View>
      </View>
    </FadeInView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    paddingBottom: PADDING_BOTTOM(45)
  },
  title: {
    fontSize: IS_SMALL_SCREEN ? 18 : 22
  },
  detailsContainer: {
    ...BASIC_SHADOW_STYLES,
    marginHorizontal: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    padding: 25
  },
  footer: {
    paddingTop: 10,
    alignItems: 'center',
    backgroundColor: '#fff'
  },
  actionButtonsWrapper: {
    width: SCREEN_WIDTH * 0.88,
    justifyContent: 'space-between',
  },
  actionButton: {
    ...BASIC_SHADOW_STYLES,
    width: SCREEN_WIDTH * 0.424,
    paddingVertical: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 7,
    backgroundColor: MAIN_COLOR
  },
  actionButtonText: {
    color: '#fff',
    paddingVertical: 2,
    fontSize: IS_SMALL_SCREEN ? 17 : 20
  }
});

export default ExposuresDetected;
