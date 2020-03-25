import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { connect } from 'react-redux';
import SplashScreen from 'react-native-splash-screen';
import { bindActionCreators } from 'redux';
import { checkForceUpdate } from '../../actions/GeneralActions';
import { ActionButton, GeneralContainer, Text, Icon, OnboardingHeader } from '../common';

interface Props {
  navigation: any,
  strings: any,
  checkForceUpdate(): void
}

const Welcome = ({ navigation, strings: { general: { start }, welcome: { title, subTitle1, subTitle2 } }, checkForceUpdate }: Props) => {
  useEffect(() => {
    setTimeout(() => {
      SplashScreen.hide();
      checkForceUpdate();
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

      <ActionButton text={start} onPress={() => navigation.navigate('Location')} containerStyle={{ marginBottom: 20 }} />
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
