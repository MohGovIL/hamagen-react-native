import React, { FunctionComponent } from 'react';
import { View, StyleSheet } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { StackNavigationProp } from '@react-navigation/stack';
import { useRoute } from '@react-navigation/native';
import AsyncStorage from '@react-native-community/async-storage';
import { ActionButton, GeneralContainer, OnboardingHeader, Text, Icon, TouchableOpacity } from '.';
import { Strings } from '../../locale/LocaleData';
import { IS_SMALL_SCREEN, MAIN_COLOR, USAGE_PRIVACY, USER_AGREE_BLE } from '../../constants/Constants';
import { Store, LocaleReducer } from '../../types';
import { toggleWebview } from '../../actions/GeneralActions';

interface Props {
    onEnd(): void
}

const BluetoothPermission: FunctionComponent<Props> = ({ onEnd }) => {
  const dispatch = useDispatch();
  const { strings: {
    general: { additionalInfo },
    bluetooth: { title, description, approveBluetooth, callToAction }
  } 
  } = useSelector<Store, LocaleReducer>(state => state.locale);
  const { params } = useRoute();

  const userApprove = async () => {
    await AsyncStorage.setItem(USER_AGREE_BLE, 'true');
    onEnd();
  };

  return (
    <>
      <View style={[{ alignItems: 'center', paddingHorizontal: 40 }, IS_SMALL_SCREEN && { paddingTop: 5 }]}>
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
        <ActionButton text={approveBluetooth} onPress={onEnd} containerStyle={{ marginBottom: 20 }} />
        {params?.showUsageLink && (
        <TouchableOpacity onPress={() => dispatch(toggleWebview(true, USAGE_PRIVACY))}>
          <Text style={{ fontSize: 14, letterSpacing: 0.26 }}>{additionalInfo}</Text>
          <View style={styles.bottomBorder} />
        </TouchableOpacity>
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
  }
});

export default BluetoothPermission;
