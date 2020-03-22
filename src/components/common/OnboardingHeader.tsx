import React from 'react';
import { View, StyleSheet } from 'react-native';
import { ChangeLanguageButton, Icon } from '.';
import { SCREEN_WIDTH } from '../../constants/Constants';

interface Props {
  hideLogo?: boolean
}

const OnboardingHeader = ({ hideLogo }: Props) => {
  return (
    <View style={[styles.container, { top: hideLogo ? 20 : 10 }]}>
      <ChangeLanguageButton />
      {!hideLogo && <Icon source={require('../../assets/onboarding/logo.png')} width={40} />}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: SCREEN_WIDTH - 40,
    flexDirection: 'row',
    position: 'absolute',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    zIndex: 1000
  }
});

export { OnboardingHeader };
