import React from 'react';
import { StyleSheet } from 'react-native';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { GeneralContainer, GoogleTimeLine, OnboardingHeader } from '../common';
import { toggleWebview } from '../../actions/GeneralActions';
import { IS_IOS, USAGE_PRIVACY } from '../../constants/Constants';

interface Props {
  navigation: any,
  strings: any,
  toggleWebview(isShow: boolean, usageType: string): void
}

const LocationHistoryOnBoarding = ({ navigation, strings, toggleWebview }: Props) => {
  return (
    <GeneralContainer style={styles.container}>
      <OnboardingHeader />

      <GoogleTimeLine
        strings={strings}
        toggleWebview={() => toggleWebview(true, USAGE_PRIVACY)}
        onCompletion={() => navigation.navigate(IS_IOS ? 'Notifications' : 'AllSet')}
      />
    </GeneralContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1
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
    toggleWebview
  }, dispatch);
};

export default connect(mapStateToProps, mapDispatchToProps)(LocationHistoryOnBoarding);
