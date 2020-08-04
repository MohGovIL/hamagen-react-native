import AsyncStorage from '@react-native-community/async-storage';
import { useFocusEffect, useRoute } from '@react-navigation/native';
import React, { FunctionComponent, useEffect, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
// @ts-ignore
import RNDisableBatteryOptimizationsAndroid from 'react-native-disable-battery-optimizations-android';
import { useDispatch, useSelector } from 'react-redux';
import { ActionButton, Icon, Text, TouchableOpacity } from '.';
import { toggleWebview } from '../../actions/GeneralActions';
import { USER_DISABLED_BATTERY } from '../../constants/ActionTypes';
import { IS_SMALL_SCREEN, MAIN_COLOR, SCREEN_WIDTH, USAGE_PRIVACY, USER_AGREED_TO_BATTERY } from '../../constants/Constants';
import { LocaleReducer, Store } from '../../types';


const useInterval = (callback: Function, delay: number | null) => {
  const savedCallback = useRef<Function>();

  useEffect(() => {
    savedCallback.current = callback;
  });

  useEffect(() => {
    function tick() {
      savedCallback.current?.();
    }
    if (delay !== null) {
      // tick()
      const id = setInterval(tick, delay);
      return () => clearInterval(id);
    }
  }, [delay]);
};

interface Props {
  onEnd(): void
}

const BatteryPermission: FunctionComponent<Props> = ({ onEnd }) => {
  // const [userPressed,setUserPressed] = useState(false)
  const dispatch = useDispatch();
  const { strings: {
    general: { additionalInfo },
    battery: { title, description, approveButton, notApproveButton }
  }
  } = useSelector<Store, LocaleReducer>(state => state.locale);

  const { params } = useRoute();
  const [intervalDelay, setIntervalDelay] = useState<number | null>(null);

  useInterval(async () => {
    const isEnabled = await RNDisableBatteryOptimizationsAndroid.isBatteryOptimizationEnabled();
    if (!isEnabled) {
      dispatch({ type: USER_DISABLED_BATTERY, payload: true });
      await AsyncStorage.setItem(USER_AGREED_TO_BATTERY, 'true');
      onEnd();
    }
  }, intervalDelay);

  // stop interval if user moved on
  useFocusEffect(React.useCallback(() => () => setIntervalDelay(null), []));

  return (
    <>
      <View style={[{ alignItems: 'center', paddingHorizontal: IS_SMALL_SCREEN ? 20 : 40 }, IS_SMALL_SCREEN && { paddingTop: 5 }]}>
        {!IS_SMALL_SCREEN && (
          <Icon
            width={80}
            customStyles={{ marginBottom: 20 }}
            source={require('../../assets/onboarding/batteryBig.png')}
          />
        )}
        <Text style={styles.title} bold>{title}</Text>
        <Text style={styles.description}>{description}</Text>
      </View>
      <View style={{ alignItems: 'center' }}>
        <ActionButton
          text={approveButton}
          onPress={() => {
            setIntervalDelay(200);
            RNDisableBatteryOptimizationsAndroid.openBatteryModal();
          }}
          containerStyle={{ marginBottom: 20 }}
        />
        {params?.showSkip && (
        <TouchableOpacity onPress={async () => {
          onEnd();
          dispatch({ type: USER_DISABLED_BATTERY, payload: false });
          AsyncStorage.setItem(USER_AGREED_TO_BATTERY, 'false');
        }}
        >
          <Text style={{ color: MAIN_COLOR }} bold>{notApproveButton}</Text>
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
  },
  termsWrapper: {
    width: SCREEN_WIDTH * 0.7,
    alignItems: 'center'
  }
});

export default BatteryPermission;
