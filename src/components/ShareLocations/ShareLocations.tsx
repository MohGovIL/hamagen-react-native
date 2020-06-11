import React, { useState, useEffect } from 'react';
import { StyleSheet, AppState, AppStateStatus, View } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import NetInfo, { NetInfoState } from '@react-native-community/netinfo';
import { useDispatch, useSelector } from 'react-redux';
import { ActionButton, HeaderButton, Icon, Text, TouchableOpacity } from '../common';
import { shareUserLocations } from '../../actions/DeepLinkActions';
import { Strings } from '../../locale/LocaleData';
import { LocaleReducer, Store } from '../../types';
import { IS_SMALL_SCREEN, PADDING_BOTTOM, PADDING_TOP, TEXT_COLOR, IS_IOS, ENABLE_BLE } from '../../constants/Constants';

interface Props {
  route: any,
  navigation: StackNavigationProp<any>,
  strings: Strings
}

const SHARE_FAIL_ICON = require('../../assets/shareLocation/shareFail.png');

const ICON = {
  beforeShare: require('../../assets/shareLocation/beforeShare.png'),
  shareSuccess: require('../../assets/shareLocation/shareSuccess.png'),
  shareNoConnection: SHARE_FAIL_ICON,
  shareFail: SHARE_FAIL_ICON,
};

type ShareStates = 'beforeShare' | 'shareNoConnection' | 'shareSuccess' | 'shareFail'
type ShareFailState = '' | 'MissingToken' | 'TokenError' | 'WithWarnings'

const ShareLocations = ({ route, navigation }: Props) => {
  const { isRTL, strings: { shareLocation: { title, description, greeting, button, addBleDataText } } } = useSelector<Store, LocaleReducer>(state => state.locale);
  const dispatch = useDispatch();

  const [state, setState] = useState<ShareStates>('beforeShare');
  const [failState, setFailState] = useState<ShareFailState>('');
  const [canRetry, setRetryState] = useState(true);
  const [agreeToBle, onValueSelected] = useState(true);
  const { token } = route.params;

  useEffect(() => {
    const netInfoUnsubscribe = NetInfo.addEventListener((state: NetInfoState) => {
      if (!state.isConnected) {
        setState('shareNoConnection');
      }
    });

    AppState.addEventListener('change', (state: AppStateStatus) => {
      if (state === 'background') {
        navigation.pop();
      }
    });

    return () => {
      netInfoUnsubscribe();
      AppState.removeEventListener('change', () => { });
    };
  }, []);

  const onButtonPress = async () => {
    try {
      if (canRetry) {
        const { statusCode, statusDesc }: any = await dispatch(shareUserLocations(token, agreeToBle));

        switch (statusCode) {
          case 'CompletSuccessfully': {
            setState('shareSuccess');
            setRetryState(false);
            break;
          }
          case 'CompleteWithWarnings': {
            setState('shareFail');
            setFailState('WithWarnings');
            setRetryState(false);
            break;
          }
          case 'RunTimeError': {
            setState('shareFail');
            setFailState('MissingToken');
            break;
          }
          case 'InvalidOperation': {
            switch (statusDesc) {
              case "1":
              case "2":
              case 1:
              case 2: {
                setState('shareFail');
                setFailState('TokenError');
                break;
              }
              case "3":
              case 3: {
                setState('shareSuccess');
                setRetryState(false);
                break;
              }
              default: {
                setState('shareFail');
              }
            }
            break;
          }
          default: {
            setState('shareFail');
          }
        }
      } else {
        navigation.goBack();
      }
    } catch (error) {
      setState('shareFail');
      setRetryState(false);
    }
  };

  const Header = canRetry ? <HeaderButton type="close" onPress={() => navigation.pop()} /> : null;
  // @ts-ignore
  const combinedState: ShareStates & ShareFailState = state + failState;

  const AgreeToBleCheckbox = () => {
    if (!IS_IOS && ENABLE_BLE && state === 'beforeShare') {
      return (
        <TouchableOpacity style={{ flexDirection: isRTL ? 'row-reverse' : 'row', marginBottom: 23, paddingHorizontal: 30, alignItems: 'center' }} onPress={() => onValueSelected(!agreeToBle)} accessibilityRole="checkbox" checked={agreeToBle}>
          <View style={styles.box}>
            {agreeToBle && <Icon source={require('../../assets/onboarding/checked.png')} height={8} width={12} customStyles={{ tintColor: TEXT_COLOR }} />}
          </View>

          <Text style={[styles.text, { textAlign: isRTL ? 'right' : 'left' }]}>{addBleDataText}</Text>

        </TouchableOpacity>
      );
    }

    return null;
  };

  return (
    <View style={styles.container}>
      {Header}

      <View style={{ alignItems: 'center' }}>
        <Icon source={ICON[state]} width={IS_SMALL_SCREEN ? 66 : 88} height={IS_SMALL_SCREEN ? 45 : 60} />

        <Text style={styles.title} bold>{title[state]}</Text>
        <Text style={{ ...styles.description, fontSize: IS_SMALL_SCREEN ? 14 : 16 }}>{description[combinedState]}</Text>
        <Text style={{ fontSize: IS_SMALL_SCREEN ? 14 : 16 }} bold>{greeting[state]}</Text>
      </View>
      <View style={{ alignItems: 'center' }}>
        <AgreeToBleCheckbox />
        <ActionButton text={button[combinedState]} onPress={onButtonPress} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: PADDING_TOP(IS_SMALL_SCREEN ? 40 : 90),
    paddingBottom: PADDING_BOTTOM(IS_SMALL_SCREEN ? 15 : 30),
    paddingHorizontal: 30,
    backgroundColor: '#fff'
  },
  title: {
    fontSize: IS_SMALL_SCREEN ? 19 : 22,
    marginVertical: 25
  },
  description: {
    marginBottom: 17,
    lineHeight: 19
  },
  box: {
    width: 20,
    height: 20,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderColor: TEXT_COLOR
  },
  text: {
    fontSize: 13,
    lineHeight: 18,
    color: '#6a6a6a',
    paddingHorizontal: 10,
  }
});

export default ShareLocations;
