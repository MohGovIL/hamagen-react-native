import React, { useRef, useState } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import moment from 'moment';
import { FadeInView, Icon, Text, TouchableOpacity } from '../common';
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
  strings: any,
  exposures: Exposure[],
  onValidExposure(exposure: Exposure): void,
  dismissExposure(exposureId: number): void
}

const ExposuresDetected = (
  {
    isRTL,
    strings: { scanHome: { found, exposureEvents, reportedAt, inDate, fromHour, toHour, wereYouThere, no, canContinue, yes, needDirections } },
    exposures,
    onValidExposure,
    dismissExposure
  }: Props
) => {
  const currentExposure = useRef(1);

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

  const renderExposure = ({ properties: { Name, Place, fromTime, toTime } }: Exposure) => (
    <Animated.View style={[styles.detailsContainer, scale]}>
      <Text style={{ fontSize: 14, marginBottom: 15 }}>{`${currentExposure.current}/${exposures.length}`}</Text>
      <Text style={{ marginBottom: 15 }}>{`${Name} ${reportedAt}`}</Text>
      <Text
        style={{ fontSize: 18, lineHeight: 25 }}
        bold
      >
        {`${Place} ${inDate} ${moment.utc(fromTime).format('DD.MM.YY')} ${fromHour} ${moment.utc(fromTime).format('HH:mm')} ${toHour} ${moment.utc(toTime).format('HH:mm')}`}
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
      <View style={{ alignItems: 'center' }}>
        <Icon source={require('../../assets/main/exposures.png')} width={IS_SMALL_SCREEN ? 66 : 99} height={IS_SMALL_SCREEN ? 40 : 59} customStyles={{ marginBottom: 12 }} />
        <Text style={styles.title} bold>{`${found} ${exposures.length} ${exposureEvents}`}</Text>
      </View>

      {renderExposure(exposures[0])}

      <View style={{ alignItems: 'center' }}>
        <Text style={!IS_SMALL_SCREEN && { marginBottom: 25 }}>{wereYouThere}</Text>

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
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingBottom: PADDING_BOTTOM(0)
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
