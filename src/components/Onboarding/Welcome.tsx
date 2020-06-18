import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { connect } from 'react-redux';
import SplashScreen from 'react-native-splash-screen';
import { bindActionCreators } from 'redux';
import { StackNavigationProp } from '@react-navigation/stack';
import { checkForceUpdate } from '../../actions/GeneralActions';
import { ActionButton, GeneralContainer, Text, Icon, OnboardingHeader } from '../common';
import { Strings } from '../../locale/LocaleData';

interface Props {
  navigation: StackNavigationProp<any>,
  strings: Strings,
  checkForceUpdate(): void
}

const Welcome = ({ navigation, strings: { general: { start }, welcome: { title, subTitle1, subTitle2 } }, checkForceUpdate }: Props) => {
  useEffect(() => {
    setTimeout(() => {
      SplashScreen.hide();
      setTimeout(() => checkForceUpdate(), 1000);
    }, 3000);
  }, []);

  return (
    <GeneralContainer style={styles.container}>
      <OnboardingHeader hideLogo />

      <View style={{ alignItems: 'center', paddingHorizontal: 40 }}>
        <Icon source={require('../../assets/onboarding/israeliMinistryOfHealthLogo.png')} width={134} height={80} customStyles={{ marginBottom: 25 }} />
        <Text style={styles.title} bold>{title}</Text>
        <Text style={styles.subTitle}>{subTitle1}</Text>
        <Text bold>{subTitle2}</Text>
      </View>

      <ActionButton text={start} onPress={() => navigation.navigate('location')} containerStyle={{ marginBottom: 20 }} />
    </GeneralContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 22,
    marginBottom: 25
  },
  subTitle: {
    lineHeight: 24,
    marginBottom: 25
  }
});

const mapStateToProps = (state: any) => {
  const {
    locale: { strings }
  } = state;

  return { strings };
};

const mapDispatchToProps = (dispatch: any) => {
  return bindActionCreators({
    checkForceUpdate
  }, dispatch);
};

export default connect(mapStateToProps, mapDispatchToProps)(Welcome);
