import React, { useMemo } from 'react';
import { Modal ,View, StyleSheet} from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { useSelector, useDispatch } from 'react-redux';
import moment from 'moment';
import { HeaderButton, Icon, Text } from '../common';
import { SCREEN_HEIGHT, SCREEN_WIDTH, PADDING_TOP, IS_SMALL_SCREEN } from '../../constants/Constants';
import { HIDE_MAP_MODAL } from '../../constants/ActionTypes';
import { Store, GeneralReducer, LocaleReducer } from '../../types';

const MapModal = () => {
  const dispatch = useDispatch();
  const {
    showMap: { visible, region, properties: { Place, fromTime } },
  } = useSelector<Store, GeneralReducer>(state => state.general);
  const {
    strings: {
      scanHome: { inDate, fromHour, wereYouThere, wasNotMe, wasMe, suspectedExposure, events, possibleExposure, atPlace, showOnMap },
    },
  } = useSelector<Store, LocaleReducer>(state => state.locale);
  
  
  
  const [date,hour] = useMemo(() => {
    const time = moment(fromTime)
    return [time.format('DD.MM.YY'),time.format('DD.MM.YY')]
  }, [fromTime])

  return (
    <Modal visible={visible} animationType="slide">
      <HeaderButton type="close" onPress={() => dispatch({ type: HIDE_MAP_MODAL })} />
      <View style={styles.headerContainer}>
        <Icon source={require('../../assets/main/exposuresSmall.png')} width={27} height={17} customStyles={styles.headerIcon}/>
        <Text bold style={styles.place}>{Place}</Text>
        <Text style={styles.aroundTime}>{`${inDate} ${date} ${fromHour} ${hour}`}</Text>
      </View>
      <MapView
        style={styles.mapStyle}
        region={region}
      >
        <Marker
          coordinate={region}
          image={require('../../assets/main/mapMarker.png')}
        />
      </MapView>

    </Modal>
  );
};


const styles = StyleSheet.create({
  headerContainer: { height: SCREEN_HEIGHT * 0.22, justifyContent: 'center', alignItems: 'center', paddingTop: PADDING_TOP(51), marginBottom: IS_SMALL_SCREEN ? 28 : 0 },
  headerIcon: {marginBottom: 8},
  place: {fontSize: 16},
  aroundTime: {fontSize: 14,marginTop: 10},
  mapStyle: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT * 0.78,
  }
})

export default MapModal;
