import React, { FunctionComponent } from 'react';
import { StyleSheet, View } from 'react-native';
import BackgroundGeolocation, { DeviceSettingsRequest } from 'react-native-background-geolocation';
import { TouchableWithoutFeedback } from 'react-native-gesture-handler';
import { useDispatch, useSelector } from 'react-redux';
import { BASIC_SHADOW_STYLES, HIT_SLOP, IS_SMALL_SCREEN, WHITE } from '../../../constants/Constants';
import { GeneralReducer, LocaleReducer, Store } from '../../../types';
import { HeaderButton, Icon, Text } from '../../common';

interface Props {
    onEnd(): void
}

const BatteryPermission: FunctionComponent<Props> = ({ navigation }) => {
  // const [userPressed,setUserPressed] = useState(false)
  const dispatch = useDispatch();
  const { isRTL, strings: {
    batterySettings: { title, description, recommendation, batteryOptimizationOn, batteryOptimizationOff, settingsBtn }
  } } = useSelector<Store, LocaleReducer>(state => state.locale);
  const { batteryDisabled } = useSelector<Store, GeneralReducer>(state => state.general);


  return (
    <View style={[styles.container]}>
      <HeaderButton onPress={navigation.goBack} />
      <View style={{ alignItems: 'center', }}>

        <Icon
          width={106}
          customStyles={{ marginBottom: 20 }}
          source={require('../../../assets/onboarding/batteryBig.png')}
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

        }]}
      >

        <View style={[styles.dot, { backgroundColor: batteryDisabled ? 'rgb(195,219,110)' : 'rgb(255,130,130)' }]} />

        <TouchableWithoutFeedback
          hitSlop={HIT_SLOP}
          onPress={async () => {
            const request: DeviceSettingsRequest = await BackgroundGeolocation.deviceSettings.showIgnoreBatteryOptimizations();
            BackgroundGeolocation.deviceSettings.show(request);
          }}
          style={{ paddingHorizontal: IS_SMALL_SCREEN ? 8 : 16, backgroundColor: WHITE }}
        >
          <Text style={{ fontSize: 14, color: 'rgb(98,98,98)', textAlign: isRTL ? 'right' : 'left' }}>{batteryDisabled ? batteryOptimizationOn : batteryOptimizationOff }</Text>
          <View style={{ flexDirection: isRTL ? 'row-reverse' : 'row', alignItems: 'center', marginTop: 8 }}>
            <Icon source={require('../../../assets/main/settingsCog.png')} width={9} />
            <Text style={{ fontSize: 12, color: 'rgb(0,120,214)', textAlign: isRTL ? 'right' : 'left', marginHorizontal: 6 }} bold>{settingsBtn}</Text>
          </View>
        </TouchableWithoutFeedback>
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

export default BatteryPermission;
