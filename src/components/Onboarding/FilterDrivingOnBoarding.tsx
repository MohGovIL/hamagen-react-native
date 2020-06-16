import React from 'react';
import { StyleSheet, View } from 'react-native';
import { connect } from 'react-redux';
import { StackNavigationProp } from '@react-navigation/stack';
import { Strings } from '../../locale/LocaleData';
import { ActionButton, GeneralContainer, Icon, OnboardingHeader, Text, TouchableOpacity } from '../common';
import { onMotionPermissionSkipped, requestMotionPermissions } from '../../services/LocationService';
import { onError } from '../../services/ErrorService';
import { IS_SMALL_SCREEN, MAIN_COLOR } from '../../constants/Constants';

interface Props {
  navigation: StackNavigationProp<any>,
  strings: Strings,
}

const FilterDrivingOnBoarding = ({ navigation, strings: { filterDriving: { title, desc1, desc2, desc3, button, skip } } }: Props) => {
  const requestPermissions = async () => {
    try {
      await requestMotionPermissions(false);
      navigation.navigate('Bluetooth');
    } catch (error) {
      onError({ error });
    }
  };

  const onSkip = async () => {
    await onMotionPermissionSkipped();
    navigation.navigate('Bluetooth');
  };

  return (
    <GeneralContainer style={styles.container}>
      <OnboardingHeader />

      <View style={{ alignItems: 'center', paddingHorizontal: IS_SMALL_SCREEN ? 10 : 40, marginTop: IS_SMALL_SCREEN ? 20 : 0 }}>
        {
          !IS_SMALL_SCREEN && (
            <Icon source={require('../../assets/onboarding/driving.png')} width={106} height={84} customStyles={{ marginBottom: 20 }} />
          )
        }

        <Text style={styles.title} bold>{title}</Text>

        <Text style={{ lineHeight: 22 }}>
          <Text>{desc1}</Text>
          <Text bold>{` ${desc2} `}</Text>
          <Text>{desc3}</Text>
        </Text>
      </View>

      <View style={{ alignItems: 'center' }}>
        <ActionButton text={button} onPress={requestPermissions} containerStyle={{ marginBottom: 17 }} />

        <TouchableOpacity onPress={onSkip}>
          <Text style={{ color: MAIN_COLOR }} bold>{skip}</Text>
        </TouchableOpacity>
      </View>
    </GeneralContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  title: {
    fontSize: 22,
    marginVertical: 25
  }
});

const mapStateToProps = (state: any) => {
  const {
    locale: { strings }
  } = state;

  return { strings };
};

export default connect(mapStateToProps, null)(FilterDrivingOnBoarding);
