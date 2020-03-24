import React from 'react';
import { View, StyleSheet } from 'react-native';
import moment from 'moment';
import LottieView from 'lottie-react-native';
import { FadeInView, Text, TouchableOpacity } from '../common';
import { IS_SMALL_SCREEN, MAIN_COLOR, PADDING_BOTTOM, SCREEN_WIDTH, USAGE_PRIVACY } from '../../constants/Constants';

interface Props {
  firstPoint?: number,
  strings: any,
  toggleWebview(isShow: boolean, usageType: string): void
}

const NoExposures = (
  {
    firstPoint,
    strings: {
      general: { additionalInfo },
      scanHome: { noExposure, noExposure1, noExposure2, noExposure3, noExposure4, recommendation }
    },
    toggleWebview
  }: Props
) => {
  const descriptions = () => {
    if (firstPoint) {
      return `${noExposure1} ${noExposure2} ${moment(firstPoint).format('DD.MM.YY')} ${noExposure3} ${moment(firstPoint).format('HH:mm')} ${noExposure4}`;
    }

    return noExposure;
  };

  return (
    <FadeInView style={styles.container}>
      <View style={{ alignItems: 'center' }}>
        <LottieView
          style={styles.lottie}
          source={require('../../assets/lottie/magen logo.json')}
          resizeMode="cover"
          autoPlay
          loop={false}
        />

        <Text style={styles.text} bold>{descriptions()}</Text>
      </View>

      <Text style={[styles.text, { lineHeight: 22 }]}>{recommendation}</Text>

      <TouchableOpacity onPress={() => toggleWebview(true, USAGE_PRIVACY)}>
        <Text style={{ fontSize: 14 }}>{additionalInfo}</Text>
        <View style={styles.bottomBorder} />
      </TouchableOpacity>
    </FadeInView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 25,
    paddingBottom: PADDING_BOTTOM(50)
  },
  lottie: {
    width: SCREEN_WIDTH * (IS_SMALL_SCREEN ? 0.3 : 0.5),
    height: SCREEN_WIDTH * (IS_SMALL_SCREEN ? 0.3 : 0.5),
    marginBottom: 25
  },
  text: {
    width: 220
  },
  bottomBorder: {
    alignSelf: 'stretch',
    height: 2,
    borderRadius: 1,
    backgroundColor: MAIN_COLOR
  }
});

export default NoExposures;
