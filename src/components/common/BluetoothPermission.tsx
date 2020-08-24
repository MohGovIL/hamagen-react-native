import AsyncStorage from '@react-native-community/async-storage';
import { NavigationProp, useRoute } from '@react-navigation/native';
import React, { FunctionComponent } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { check, PERMISSIONS, PermissionStatus, request, RESULTS } from 'react-native-permissions';
import { useDispatch, useSelector } from 'react-redux';
import { ActionButton, Icon, Text, TouchableOpacity } from '.';
import { toggleWebview } from '../../actions/GeneralActions';
import { ENABLE_BLE } from '../../constants/ActionTypes';
import { IS_IOS, IS_SMALL_SCREEN, MAIN_COLOR, SCREEN_WIDTH, USAGE_PRIVACY, USER_AGREE_TO_BLE } from '../../constants/Constants';
import { LocaleReducer, Store } from '../../types';


interface Props {
  navigation: NavigationProp<any, 'BluetoothPermission'>
  onEnd(): void
}

const BluetoothPermission: FunctionComponent<Props> = ({ onEnd, navigation }) => {
  const dispatch = useDispatch();
  const { strings: {
    general: { additionalInfo },
    bluetooth: { title, description, approveBluetoothIOS, approveBluetoothAndroid, callToAction }
  }
  } = useSelector<Store, LocaleReducer>(state => state.locale);
  const { params } = useRoute();

  const handlePressIOS = async () => {
    const BTCheckStatus: PermissionStatus = await check(PERMISSIONS.IOS.BLUETOOTH_PERIPHERAL);
    switch (BTCheckStatus) {
      case RESULTS.BLOCKED:
      case RESULTS.UNAVAILABLE: {
        dispatch({ type: ENABLE_BLE, payload: RESULTS.BLOCKED });
        break;
      }
      case RESULTS.GRANTED: {
        dispatch({ type: ENABLE_BLE, payload: 'true' });
        await AsyncStorage.setItem(USER_AGREE_TO_BLE, 'true');
        break;
      }
      case RESULTS.DENIED: {
        const BTRequestStatus: PermissionStatus = await request(PERMISSIONS.IOS.BLUETOOTH_PERIPHERAL);
        switch (BTRequestStatus) {
          case RESULTS.UNAVAILABLE:
          case RESULTS.DENIED:
          case RESULTS.BLOCKED: {
            dispatch({ type: ENABLE_BLE, payload: RESULTS.BLOCKED });
            break;
          }
          case RESULTS.GRANTED: {
            dispatch({ type: ENABLE_BLE, payload: 'true' });
            await AsyncStorage.setItem(USER_AGREE_TO_BLE, 'true');
            break;
          }
        }
      }
    }
    onEnd();
  };

  const handlePressAndroid = async () => {
    // ENABLE_BLE
    dispatch({ type: ENABLE_BLE, payload: 'true' });
    await AsyncStorage.setItem(USER_AGREE_TO_BLE, 'true');
    onEnd();
  };

  return (
    <>
      <View style={[{ alignItems: 'center', paddingHorizontal: IS_SMALL_SCREEN ? 20 : 40 }, IS_SMALL_SCREEN && { paddingTop: 5 }]}>
        {!IS_SMALL_SCREEN && (
          <Icon
            width={80}
            customStyles={{ marginBottom: 20 }}
            source={require('../../assets/onboarding/bluetoothBig.png')}
          />
        )}
        <Text style={styles.title} bold>{title}</Text>
        <Text style={styles.description}>{description}</Text>
        <Text style={styles.callToAction} bold>{callToAction}</Text>
      </View>
      <View style={{ alignItems: 'center' }}>
        <ActionButton
          text={IS_IOS ? approveBluetoothIOS : approveBluetoothAndroid}
          onPress={Platform.select({
            ios: handlePressIOS,
            android: handlePressAndroid
          })}
          containerStyle={{ marginBottom: 20 }}
        />
        {params?.showUsageLink && (
          <View style={styles.termsWrapper}>
            <TouchableOpacity onPress={() => dispatch(toggleWebview(true, USAGE_PRIVACY))}>
              <Text style={{ fontSize: 14, letterSpacing: 0.26 }}>{additionalInfo}</Text>
              <View style={styles.bottomBorder} />
            </TouchableOpacity>
          </View>
        )}
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  lottie: {
    height: 120,
    marginBottom: 20
  },
  title: {
    fontSize: 22,
    marginBottom: 25
  },
  description: {
    lineHeight: 24,
    marginBottom: 25
  },
  callToAction: {
    lineHeight: 22,
    color: '#4d4d4d'
  },
  bottomBorder: {
    alignSelf: 'stretch',
    height: 2,
    borderRadius: 1,
    backgroundColor: MAIN_COLOR
  },
  termsWrapper: {
    width: SCREEN_WIDTH * 0.7,
    alignItems: 'center'
  }
});

export default BluetoothPermission;
