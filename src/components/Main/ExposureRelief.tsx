import React, { useState, useCallback, useRef, useMemo } from 'react';
import { View, StyleSheet, Animated, ScrollView, FlatList } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { StackNavigationProp } from '@react-navigation/stack';
import { Text, Icon, ActionButton, TouchableOpacity } from '../common';
import { IS_SMALL_SCREEN, HIT_SLOP, PADDING_TOP, MAIN_COLOR } from '../../constants/Constants';
import { Store, LocaleReducer } from '../../types';
import { moveAllToPastExposures } from '../../actions/ExposuresActions';

interface Props {
  navigation: StackNavigationProp<any>
}


const ExposureRelief = ({ navigation }: Props) => {
  const dispatch = useDispatch();
  const { isRTL,
    strings: { exposureRelief: { editBtn, title, keepSafe, backBtn } }
  } = useSelector<Store, LocaleReducer>(state => state.locale);

  return (
    <View
      style={{
        flex: 1,
        alignItems: 'center',
        justifyContent: 'space-around',
        paddingHorizontal: 30
      }}
    >
      <TouchableOpacity
        hitSlop={HIT_SLOP}
        style={{
          flexDirection: isRTL ? 'row' : 'row-reverse',
          alignContent: 'center',
          alignItems: 'center',
          position: 'absolute',
          top: PADDING_TOP(28),
          [!isRTL ? 'right' : 'left']: IS_SMALL_SCREEN ? 10 : 25,
        }}
        onPress={navigation.goBack}
      >
        <Icon
          width={IS_SMALL_SCREEN ? 20 : 24}
          source={require('../../assets/main/back.png')}
          customStyles={{ transform: [{ rotate: !isRTL ? '0deg' : '180deg' }] }}
        />
        <Text style={{ fontSize: IS_SMALL_SCREEN ? 13 : 15, color: MAIN_COLOR, marginHorizontal: IS_SMALL_SCREEN ? 5 : 8 }} bold>{editBtn}</Text>
      </TouchableOpacity>
      <View style={{ alignItems: 'center' }}>

        <Icon source={require('../../assets/main/ExposureRelief.png')} width={86} />
        <Text
          style={{
            fontSize: IS_SMALL_SCREEN ? 18 : 21,
            marginTop: IS_SMALL_SCREEN ? 25 : 28,
            marginBottom: IS_SMALL_SCREEN ? 15 : 18
          }}
          bold
        >
          {title}
        </Text>
        <Text
          style={{ fontSize: IS_SMALL_SCREEN ? 14 : 16 }}
          bold
        >
          {keepSafe}
        </Text>

      </View>
      <ActionButton
        onPress={() => {
          dispatch(moveAllToPastExposures());
          navigation.navigate('ScanHome');
        }}
        text={backBtn}
      />
    </View>
  );
};

export default ExposureRelief;
