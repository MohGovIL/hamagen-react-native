import React, { useState, useCallback, useRef, useMemo } from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { useSelector } from 'react-redux';
import { Icon, Text, TouchableOpacity, ActionButton } from '../../common';
import { IS_SMALL_SCREEN, HIT_SLOP, PADDING_TOP, MAIN_COLOR } from '../../../constants/Constants';
import { Store, LocaleReducer } from '../../../types';

const ExposureHistoryRelief = ({ navigation }) => {
  const { isRTL,
    strings: { exposureRelief: { title, keepSafe, historyBackBtn, reliefTitle } }
  } = useSelector<Store, LocaleReducer>(state => state.locale);
  return (
    <View style={styles.container}>
      <View style={styles.wrapper}>
        <Icon source={require('../../../assets/main/exposureRefresh.png')} width={86} />
        <Text style={styles.reliefTitle} bold>{reliefTitle}</Text>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.keepSafe}>{keepSafe}</Text>
      </View>
      <ActionButton onPress={navigation.goBack} text={historyBackBtn} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-around'
  },
  wrapper: {
    alignItems: 'center'
  },
  reliefTitle: {
    fontSize: IS_SMALL_SCREEN ? 18 : 21,
    marginTop: IS_SMALL_SCREEN ? 25 : 28,
    marginBottom: IS_SMALL_SCREEN ? 15 : 18
  },
  title: {
    fontSize: IS_SMALL_SCREEN ? 14 : 16,
    marginBottom: IS_SMALL_SCREEN ? 15 : 18
  },
  keepSafe: {
    fontSize: IS_SMALL_SCREEN ? 14 : 16
  }
});

export default ExposureHistoryRelief;
