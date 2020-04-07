import React, { useState } from 'react';
import { View, StyleSheet, Animated, ScrollView } from 'react-native';
import moment from 'moment';
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
  dismissExposure(exposureId: number): void
}

const ExposuresDetected = (
  {
    isRTL,
    strings: {
      scanHome: { inDate, fromHour, wereYouThere, no, canContinue, yes, needDirections, suspectedExposure, events, possibleExposure, atPlace },
    },
    exposures,
    onValidExposure,
    dismissExposure
  }: Props
) => {
  const [containerHeight, setContainerHeight] = useState(0);
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

  const renderExposure = ({ properties: { Place, fromTime } }: Exposure) => (
    <Animated.View style={[styles.detailsContainer, scale]}>
      <Text style={{ fontSize: 13, marginBottom: 5 }}>{`1/${exposures.length}`}</Text>
      <Text style={{ fontSize: 14, marginBottom: 15 }}>{possibleExposure}</Text>
      <Text
        style={{ fontSize: 18, lineHeight: 25 }}
        bold
      >
        {`${atPlace}${Place} ${inDate} ${moment(fromTime).format('DD.MM.YY')} ${fromHour} ${moment(fromTime).format('HH:mm')}?`}
      </Text>

    </Animated.View>
  );

  const renderActionButton = (text1: string, text2: string, action: () => void) => (
    <TouchableOpacity onPress={action}>
      <View style={styles.actionButton}>
        <Text style={[styles.actionButtonText, { fontSize: IS_SMALL_SCREEN ? 20 : 25 }]} bold>{text1}</Text>
        <Text style={styles.actionButtonText}>{text2}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <FadeInView style={styles.container}>
      <ScrollView
        onLayout={({ nativeEvent: { layout: { height } } }) => setContainerHeight(height)}
        contentContainerStyle={[styles.subContainer, { minHeight: containerHeight }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ alignItems: 'center', marginBottom: 10 }}>
          <Icon source={require('../../assets/main/exposures.png')} width={IS_SMALL_SCREEN ? 66 : 99} height={IS_SMALL_SCREEN ? 40 : 59} customStyles={{ marginBottom: 20 }} />
          <Text style={styles.title} bold>{`${suspectedExposure} ${exposures.length} ${events}`}</Text>
        </View>

        {renderExposure(exposures[0])}

        <View />
      </ScrollView>

      <View style={styles.footer}>
        <Text style={{ marginBottom: 15 }}>{wereYouThere}</Text>

        <View style={[styles.actionButtonsWrapper, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
          {renderActionButton(no, canContinue, onDismissExposure)}
          {renderActionButton(yes, needDirections, () => onValidExposure(exposures[0]))}
        </View>
      </View>
    </FadeInView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center'
  },
  subContainer: {
    width: SCREEN_WIDTH,
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingBottom: 10
  },
  title: {
    fontSize: IS_SMALL_SCREEN ? 18 : 22
  },
  detailsContainer: {
    ...BASIC_SHADOW_STYLES,
    width: SCREEN_WIDTH * 0.88,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    padding: 25
  },
  footer: {
    width: SCREEN_WIDTH,
    paddingTop: 10,
    paddingBottom: PADDING_BOTTOM(10),
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
    height: 80,
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
