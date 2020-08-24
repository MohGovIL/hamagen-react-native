import { NavigationProp } from '@react-navigation/native';
import React from 'react';
import { Linking, StyleSheet, View } from 'react-native';
import { useSelector } from 'react-redux';
import { IS_SMALL_SCREEN, PADDING_BOTTOM, PADDING_TOP, SCREEN_WIDTH, WHITE } from '../../../constants/Constants';
import { LocaleReducer, Store } from '../../../types';
import { ActionButton, HeaderButton, Icon, Text } from '../../common';

interface Props {
  navigation: NavigationProp<any, 'BluetoothDenied'>
}

const BluetoothDeniedModal = ({ navigation }: Props) => {
  const { strings: { BluetoothDenied: { title, description, recommendation, buttonText } } } = useSelector<Store, LocaleReducer>(state => state.locale);


  return (
    <View style={styles.container}>
      <HeaderButton type="close" onPress={navigation.goBack} />

      <Text style={styles.title} bold>{title}</Text>
      <Text style={styles.description}>{description}</Text>
      <Text style={styles.recommendation} bold>{recommendation}</Text>
      <Icon source={require('../../../assets/main/bluetoothDeniedInstruction.png')} width={SCREEN_WIDTH - 150} />

      <ActionButton
        text={buttonText}
        onPress={() => {
          Linking.openURL('app-settings:');
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-evenly',
    alignItems: 'center',
    paddingTop: PADDING_TOP(IS_SMALL_SCREEN ? 55.5 : 101),
    paddingBottom: PADDING_BOTTOM(IS_SMALL_SCREEN ? 35 : 77),
    paddingHorizontal: IS_SMALL_SCREEN ? 30 : 40,
    backgroundColor: WHITE
  },
  title: {
    fontSize: 22,
    marginBottom: 25
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
  },
  recommendation: {
    lineHeight: 16,
  },
  dot: {
    width: 14,
    height: 14,
    borderRadius: 14,

  }
});

export default BluetoothDeniedModal;
