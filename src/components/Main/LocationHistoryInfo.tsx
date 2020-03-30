import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Icon, Text, TouchableOpacity } from '../common';
import { SCREEN_WIDTH } from '../../constants/Constants';

interface Props {
  isRTL: boolean,
  info: string,
  moreInfo: string,
  onPress(): void
}

const LocationHistoryInfo = ({ isRTL, info, moreInfo, onPress }: Props) => {
  return (
    <TouchableOpacity onPress={onPress}>
      <View style={[styles.container, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
        <Icon source={require('../../assets/locationHistory/info.png')} width={18} />
        <Text style={styles.textContainer}>
          <Text style={styles.text}>{info}</Text>
          <Text style={[styles.text, { textDecorationLine: 'underline' }]} bold>{moreInfo}</Text>
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: SCREEN_WIDTH - 36,
    alignItems: 'center',
    paddingHorizontal: 10,
    borderRadius: 14,
    backgroundColor: 'rgba(230,230,230,0.45)'
  },
  textContainer: {
    flex: 1,
    paddingVertical: 15,
    paddingHorizontal: 5
  },
  text: {
    color: 'rgb(77,77,77)',
    fontSize: 12,
    lineHeight: 12,
  }
});

export default LocationHistoryInfo;
