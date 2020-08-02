import React, { FunctionComponent, useMemo } from 'react';
import { View, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import moment from 'moment';
import { Icon, Text, TouchableOpacity } from '../../common';
import { Strings } from '../../../locale/LocaleData';
import { BASIC_SHADOW_STYLES, MAIN_COLOR, SCREEN_WIDTH } from '../../../constants/Constants';
import CardIdentifyTag from '../../common/CardIdentifyTag';
import * as LocalizedStyles from '../../../constants/LocalizedStyles';

interface Props {
  isRTL: boolean,
  strings: Strings,
  Place: string,
  fromTime: number,
  style?: StyleProp<ViewStyle>,
  showExposureOnMap(): void
}

const ExposureHistoryListItem: FunctionComponent<Props> = ({ children, style, isRTL, strings: { scanHome: { fromHour, showOnMap, inDate, betweenHours, locationCloseTag, deviceCloseTag }, exposuresHistory: { BLELocationUpdate } }, Place, fromTime, BLETimestamp, showExposureOnMap }) => {
  const isBLE: boolean = useMemo(() => Boolean(BLETimestamp), [BLETimestamp]);

  let TimeText;

  if (isBLE) {
    const time = moment(BLETimestamp).startOf('hour');

    const exposureDate = time.format('DD.MM.YY');
    const exposureStartHour = time.format('HH:mm');
    const exposureEndHour = time.add(1, 'hour').format('HH:mm');

    TimeText = (
      <Text style={{ textAlign: LocalizedStyles.side(isRTL) }}>
        <Text style={styles.text} bold>{`${exposureDate} `}</Text>
        <Text style={styles.text}>{`${betweenHours} `}</Text>
        <Text style={styles.text} bold>{`${exposureStartHour}-${exposureEndHour}`}</Text>
      </Text>
    );
  } else {
    TimeText = (
      <Text style={{ textAlign: LocalizedStyles.side(isRTL) }}>
        <Text style={styles.text} bold>{`${moment(fromTime).format('DD.MM.YY')} `}</Text>
        <Text style={styles.text}>{`${fromHour} `}</Text>
        <Text style={styles.text} bold>{`${moment(fromTime).format('HH:mm')}`}</Text>
      </Text>
    );
  }

  let LocationUpdateTag = null;
  if (isBLE && Place) {
    LocationUpdateTag = (
      <View
        style={{
          flexDirection: LocalizedStyles.flexDirection(isRTL),
          paddingBottom: 10
        }}
      >
        <View
          style={{
            flex: 1,
            flexDirection: LocalizedStyles.flexDirection(isRTL),
              
              
          }}
        >
          <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: 'rgb(44,191,220)', marginHorizontal: 6 }} />
          <Text style={{ fontSize: 12, letterSpacing: -0.09, textAlign: LocalizedStyles.side(isRTL) }}>{BLELocationUpdate}</Text>
        </View>
        <View
          style={{
            flex: 1,
            flexDirection: LocalizedStyles.flexDirection(isRTL),
            alignItems: 'flex-start',
            justifyContent: 'flex-end',
          }}
        >
          <CardIdentifyTag isRTL={isRTL} text={isBLE ? deviceCloseTag : locationCloseTag} color={isBLE ? 'rgba(44,191,220,0.5)' : 'rgba(217,228,140,0.6)'} float={false} />
        </View>
      </View>
    );
  } else {
    LocationUpdateTag = (
      <View
        style={{
          flex: 1,
          flexDirection: LocalizedStyles.flexDirection(isRTL, true),
          alignContent: 'center',
          justifyContent: 'space-between',
          paddingBottom: 10
        }}
      >
        <CardIdentifyTag isRTL={isRTL} text={isBLE ? deviceCloseTag : locationCloseTag} color={isBLE ? 'rgba(44,191,220,0.5)' : 'rgba(217,228,140,0.6)'} float={false} />
      </View>
    );
  }

  let ShowPlaceText = null;
  if (Place) {
    ShowPlaceText = (
      <>
        <Text style={[styles.text, { textAlign: LocalizedStyles.side(isRTL) }]} bold>{Place}</Text>
        <TouchableOpacity onPress={showExposureOnMap}>
          <View style={{ flexDirection: LocalizedStyles.flexDirection(isRTL), alignItems: 'center' }}>
            <Icon source={require('../../../assets/main/map.png')} width={12} height={10} />
            <Text style={styles.showOnMap} bold>{showOnMap}</Text>
          </View>
        </TouchableOpacity>
      </>
    );
  }

  return (
    <View style={[styles.listItemContainer, style]}>
      {LocationUpdateTag}
      <View
        style={{
          paddingBottom: 20,
          paddingHorizontal: 15,
          flexDirection: LocalizedStyles.flexDirection(isRTL),
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <Icon source={require('../../../assets/main/exposuresSmall.png')} width={32} height={20} customStyles={{ marginHorizontal: 7.5 }} />
        <View style={[styles.textContainer, { alignItems: LocalizedStyles.alignItems(isRTL) }]}>

          {TimeText}

          {ShowPlaceText}

          {children}
        </View>

      </View>


    </View>
  );
};

const styles = StyleSheet.create({
  listItemContainer: {
    ...BASIC_SHADOW_STYLES,

    borderRadius: 13,
    overflow: 'hidden'
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
