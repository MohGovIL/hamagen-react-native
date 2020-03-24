import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, Linking, AppState, AppStateStatus } from 'react-native';
import { connect } from 'react-redux';
import { check, PERMISSIONS, RESULTS } from 'react-native-permissions';
import { ActionButton, GeneralContainer, TouchableOpacity, Text, OnboardingHeader, Icon } from '../common';
import { onError } from '../../services/ErrorService';
import { IS_SMALL_SCREEN, MAIN_COLOR, SCREEN_WIDTH } from '../../constants/Constants';

interface Props {
  navigation: any,
  strings: any,
  isRTL: boolean
}

const LocationIOS = ({ navigation, strings: { locationIOS: { title, subTitle1, subTitle2, goToSettings, set } }, isRTL }: Props) => {
  const appStateStatus = useRef<AppStateStatus>('active');
  const [isLocationAllowed, setIsLocationAllowed] = useState(false);

  useEffect(() => {
    checkIOSLocation();

    AppState.addEventListener('change', onAppStateChange);
    return () => { AppState.removeEventListener('change', onAppStateChange); };
  });

  const onAppStateChange = async (state: AppStateStatus) => {
    if (state === 'active' && appStateStatus.current !== 'active') {
      await checkIOSLocation();
    }

    appStateStatus.current = state;
  };

  const checkIOSLocation = async () => {
    try {
      const res = await check(PERMISSIONS.IOS.LOCATION_ALWAYS);
      setIsLocationAllowed(res === RESULTS.GRANTED);
    } catch (error) {
      onError({ error });
    }
  };

  return (
    <GeneralContainer style={styles.container}>
      <OnboardingHeader />

      <View style={[{ alignItems: 'center' }, IS_SMALL_SCREEN && { paddingHorizontal: 10, paddingTop: 5 }]}>
        <Text style={styles.title} bold>{title}</Text>
        <Text style={styles.subTitle}>{subTitle1}</Text>
      </View>

      <View style={{ alignItems: 'center' }}>
        <Text bold>{subTitle2}</Text>

        <Icon source={require('../../assets/onboarding/locationTutorial.png')} width={SCREEN_WIDTH - 50} height={106} customStyles={{ marginVertical: 25 }} />

        <TouchableOpacity onPress={() => Linking.openURL('app-settings:')}>
          <View style={{ flexDirection: isRTL ? 'row-reverse' : 'row', alignItems: 'center', paddingHorizontal: IS_SMALL_SCREEN ? 20 : 0 }}>
            <Icon source={require('../../assets/onboarding/settings.png')} width={17} customStyles={{ marginHorizontal: 7 }} />
            <Text style={{ color: MAIN_COLOR, textDecorationLine: 'underline' }} bold>{goToSettings}</Text>
          </View>
        </TouchableOpacity>
      </View>

      <ActionButton
        text={set}
        isDisabled={!isLocationAllowed}
        onPress={() => navigation.navigate('Notifications')}
        containerStyle={{ marginVertical: IS_SMALL_SCREEN ? 0 : 20 }}
      />
    </GeneralContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  lottie: {
    width: 57,
    height: 94,
    marginBottom: 20
  },
  title: {
    fontSize: 22,
    marginBottom: IS_SMALL_SCREEN ? 5 : 25
  },
  subTitle: {
    lineHeight: IS_SMALL_SCREEN ? 15 : 24
  },
  bottomBorder: {
    alignSelf: 'stretch',
    height: 2,
    borderRadius: 1,
    backgroundColor: MAIN_COLOR
  }
});

const mapStateToProps = (state: any) => {
  const {
    locale: { strings, isRTL }
  } = state;

  return { strings, isRTL };
};

export default connect(mapStateToProps, null)(LocationIOS);
