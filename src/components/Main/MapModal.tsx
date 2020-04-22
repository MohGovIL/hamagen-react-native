import React from 'react';
import { View, StyleSheet, Modal } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { useSelector, useDispatch } from 'react-redux';
import { CloseButton } from '../common';
import { SCREEN_HEIGHT, SCREEN_WIDTH } from '../../constants/Constants';
import { HIDE_MAP_MODAL } from '../../constants/ActionTypes';
import { Store, GeneralReducer } from '../../types';

const MapModal = () => {
  const dispatch = useDispatch();
  const {
    showMap: { visible, region },
  } = useSelector<Store, GeneralReducer>(state => state.general);

  return (
    <Modal visible={visible} animationType="slide">
      <MapView
        style={{
          width: SCREEN_WIDTH,
          height: SCREEN_HEIGHT,
        }}
        region={region}
      >
        <Marker
          coordinate={region}
        />
      </MapView>
      <CloseButton onPress={() => dispatch({ type: HIDE_MAP_MODAL })} />
    </Modal>
  );
};

export default MapModal;
