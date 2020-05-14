import React, { Children, ReactNode } from 'react';
import { View, StyleSheet, StyleProp } from 'react-native';
import moment from 'moment';
import { Icon, Text, TouchableOpacity } from '../../common';
import { Strings } from '../../../locale/LocaleData';
import { BASIC_SHADOW_STYLES, MAIN_COLOR, SCREEN_WIDTH } from '../../../constants/Constants';

interface Props {
  isRTL: boolean,
  strings: Strings,
  Place: string,
  fromTime: number,
  children: ReactNode | undefined,
  style: StyleProp,
  showExposureOnMap(): void
}

const ExposureHistoryListItem = ({children,style, isRTL, strings: { scanHome: { fromHour, showOnMap } }, Place, fromTime, showExposureOnMap }: Props) => {
  return (
    <View style={[styles.listItemContainer, { flexDirection: isRTL ? 'row-reverse' : 'row' },style]}>
      <Icon source={require('../../../assets/main/exposuresSmall.png')} width={32} height={20} customStyles={{ marginHorizontal: 7.5 }} />

      <View style={[styles.textContainer, { alignItems: isRTL ? 'flex-end' : 'flex-start' }]}>
        <Text style={{ textAlign: isRTL ? 'right' : 'left' }}>
          <Text style={styles.text} bold>{`${moment(fromTime).format('DD.MM.YY')} `}</Text>
          <Text style={styles.text}>{`${fromHour} `}</Text>
          <Text style={styles.text} bold>{`${moment(fromTime).format('HH:mm')}`}</Text>
        </Text>

        <Text style={[styles.text, { textAlign: isRTL ? 'right' : 'left' }]} bold>{Place}</Text>

        <TouchableOpacity onPress={showExposureOnMap}>
          <View style={{ flexDirection: isRTL ? 'row-reverse' : 'row', alignItems: 'center' }}>
            <Icon source={require('../../../assets/main/map.png')} width={12} height={10} />
            <Text style={styles.showOnMap} bold>{showOnMap}</Text>
          </View>
        </TouchableOpacity>
      {children}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  listItemContainer: {
    ...BASIC_SHADOW_STYLES,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 13,
    paddingVertical: 20,
    paddingHorizontal: 15,
  },
  textContainer: {
    flex: 1,
    marginHorizontal: 7.5
  },
  text: {
    fontSize: 13,
    lineHeight: 20,
    marginVertical: 10
  },
  separator: {
    width: SCREEN_WIDTH * 0.875,
    height: 2,
    borderRadius: 1,
    backgroundColor: '#eaeaea'
  },
  showOnMap: {
    fontSize: 12,
    color: MAIN_COLOR,
    paddingHorizontal: 5
  }
});

export default ExposureHistoryListItem;
