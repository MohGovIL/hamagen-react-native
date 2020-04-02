import React from 'react';
import { StyleSheet } from 'react-native';
import { connect } from 'react-redux';
import { Strings } from '../../locale/LocaleData';
import { GeneralContainer, OnboardingHeader } from '../common';

interface Props {
  navigation: any,
  strings: Strings,
}

const FilterDriving = ({ navigation, strings}: Props) => {
  return (
    <GeneralContainer style={styles.container}>
      <OnboardingHeader />
    </GeneralContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  }
});

const mapStateToProps = (state: any) => {
  const {
    locale: { strings }
  } = state;

  return { strings };
};

export default connect(mapStateToProps, null)(FilterDriving);
