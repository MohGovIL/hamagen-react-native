import React, { FunctionComponent } from 'react';
import { StyleSheet, View } from 'react-native';
import { Switch } from 'react-native-gesture-handler';
import { useSelector } from 'react-redux';
import { BASIC_SHADOW_STYLES, IS_SMALL_SCREEN, MAIN_COLOR, WHITE } from '../../../constants/Constants';
import { toggleBLEService } from '../../../services/BLEService';
import { GeneralReducer, LocaleReducer, Store } from '../../../types';
import { HeaderButton, Icon, Text } from '../../common';

interface Props {

}

const BluetoothSettings: FunctionComponent<Props> = ({ navigation }) => {
  const { isRTL, strings: {
    bluetoothSettings: { title, description, recommendation, BLEOn, BLEOff }
  } } = useSelector<Store, LocaleReducer>(state => state.locale);
  const { enableBle } = useSelector<Store, GeneralReducer>(state => state.general);


  return (
    <View style={[styles.container]}>
      <HeaderButton onPress={navigation.goBack} />
      <View style={{ alignItems: 'center', }}>

        <Icon
          width={106}
          customStyles={{ marginBottom: 20 }}
          source={require('../../../assets/onboarding/bluetoothBig.png')}
        />

        <Text style={styles.title} bold>{title}</Text>
        <Text style={styles.description}>{description}</Text>
        <Text style={{ fontSize: 16, color: 'rgb(98,98,98)', lineHeight: 24, }} bold>{recommendation}</Text>

      </View>

      <View
        style={[{
          ...BASIC_SHADOW_STYLES,
          paddingVertical: IS_SMALL_SCREEN ? 16 : 24,
          paddingHorizontal: IS_SMALL_SCREEN ? 8 : 16,
          borderRadius: 13,
          flexDirection: isRTL ? 'row-reverse' : 'row',
          justifyContent: 'space-between',
          alignItems: 'center'
        }]}
      >

        <Text style={{ flex: 1, color: 'rgb(98,98,98)', textAlign: isRTL ? 'right' : 'left' }} bold>{enableBle ? BLEOn : BLEOff}</Text>
        <Switch
          thumbColor={enableBle ? MAIN_COLOR : WHITE}
          trackColor={{ true: 'rgb(145,199,231)', false: 'rgb(190,190,190)' }}
          ios_backgroundColor="rgb(190,190,190)"
          style={{ [isRTL ? 'marginRight' : 'marginLeft']: 10 }}
          value={Boolean(enableBle)}
          onValueChange={() => {
            if (enableBle === null) {
              navigation.replace('Bluetooth');
            } else {
              toggleBLEService(!enableBle);
            }
          }}
        />

      </View>
    </View>


  );
};
// 'rgb(195,219,110)' : 'rgb(255,130,130)'
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-evenly',
    alignContent: 'center',
    paddingHorizontal: IS_SMALL_SCREEN ? 30 : 40,
    backgroundColor: WHITE
  },
  title: {
    fontSize: 22,
    marginBottom: 25
  },
  description: {
    lineHeight: 24,
    marginBottom: 25,
    color: 'rgb(109,109,109)'
  },
  callToAction: {
    lineHeight: 22,
    color: '#4d4d4d'
  },
  dot: {
    width: 14,
    height: 14,
    borderRadius: 14,

  }
});

export default BluetoothSettings;
