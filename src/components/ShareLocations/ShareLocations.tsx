import React, { useState, useEffect } from 'react';
import { StyleSheet, AppState, AppStateStatus, View } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import NetInfo, { NetInfoState } from '@react-native-community/netinfo';
import { useDispatch, useSelector } from 'react-redux';
import { ActionButton, HeaderButton, Icon, Text } from '../common';
import { shareUserLocations } from '../../actions/DeepLinkActions';
import { Strings } from '../../locale/LocaleData';
import { LocaleReducer, Store } from '../../types';
import { IS_SMALL_SCREEN, PADDING_BOTTOM, PADDING_TOP } from '../../constants/Constants';

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

type ShareStates = 'beforeShare'|'shareNoConnection'|'shareSuccess'|'shareFail'
type ShareFailState = ''|'MissingToken'|'TokenError'|'WithWarnings'

const ShareLocations = ({ route, navigation }: Props) => {
  const { strings: { shareLocation: { title, description, greeting, button } } } = useSelector<Store, LocaleReducer>(state => state.locale);
  const dispatch = useDispatch();

  const [state, setState] = useState<ShareStates>('beforeShare');
  const [failState, setFailState] = useState<ShareFailState>('');
  const [canRetry, setRetryState] = useState(true);
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
      AppState.removeEventListener('change', () => {});
    };
  }, []);

  const onButtonPress = async () => {
    try {
      if (canRetry) {
        const { statusCode, statusDesc }: any = await dispatch(shareUserLocations(token));

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
              case 1:
              case 2: {
                setState('shareFail');
                setFailState('TokenError');
                break;
              }
              case 3: {
                setState('shareSuccess');
                setRetryState(false);
                break;
              }
              default: {
                setState('shareFail');
                setRetryState(false);
              }
            }
            break;
          }
          default: {
            setState('shareFail');
            setRetryState(false);
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

  return (
    <View style={styles.container}>
      {Header}

      <View style={{ alignItems: 'center' }}>
        <Icon source={ICON[state]} width={IS_SMALL_SCREEN ? 66 : 88} height={IS_SMALL_SCREEN ? 45 : 60} />

        <Text style={styles.title} bold>{title[state]}</Text>
        <Text style={{ ...styles.description, fontSize: IS_SMALL_SCREEN ? 14 : 16 }}>{description[combinedState]}</Text>
        <Text style={{ fontSize: IS_SMALL_SCREEN ? 14 : 16 }} bold>{greeting[state]}</Text>
      </View>

      <ActionButton text={button[combinedState]} onPress={onButtonPress} />
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
  }
});

export default ShareLocations;
