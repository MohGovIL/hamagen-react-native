import React, { FunctionComponent } from 'react';
import { StyleSheet } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import DeviceInfo from 'react-native-device-info';
import { GeneralContainer, OnboardingHeader } from '../common';
import { IS_IOS } from '../../constants/Constants';
import BluetoothPermission from '../common/BluetoothPermission';

interface Props {
  navigation: StackNavigationProp<any, 'BluetoothOnboarding'>,
}

const BluetoothOnboarding: FunctionComponent<Props> = ({ navigation }) => {
  return (
    <GeneralContainer style={styles.container}>
      <OnboardingHeader />
      <BluetoothPermission
        onEnd={() => {
          if (IS_IOS) {
            navigation.navigate('LocationHistoryOnBoarding');
          } else {
            let destination = 'LocationHistoryOnBoarding';
            const androidVersion = parseInt(DeviceInfo.getSystemVersion().split(',')[0]);
            if (androidVersion >= 6) {
              destination = 'Battery';
            }
            navigation.navigate(destination);
          }
        }
        }
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
});

export default BluetoothOnboarding;
