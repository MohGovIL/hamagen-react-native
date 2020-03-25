import React, { useRef, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import LottieView from 'lottie-react-native';
import * as Animatable from 'react-native-animatable';
import { ActionButton, GeneralContainer, OnboardingHeader, Text, TermsOfUse } from '../common';
import { toggleWebview } from '../../actions/GeneralActions';
import { requestPermissions } from '../../services/LocationService';
import { IS_IOS, IS_SMALL_SCREEN, MAIN_COLOR, USAGE_ON_BOARDING } from '../../constants/Constants';

interface Props {
  navigation: any,
  isRTL: boolean,
  strings: any,
  toggleWebview(isShow: boolean, usageType: string): void
}

const Location = ({ navigation, isRTL, strings, toggleWebview }: Props) => {
  const { location: { title, subTitle1, subTitle2IOS, subTitle2Android, approveLocation } } = strings;

  const animRef = useRef<any>(null);

  const [isTOUAccepted, setIsTOUAccepted] = useState(false);

  const requestLocationPermissions = async () => {
    try {
      if (!isTOUAccepted) {
        return animRef.current.shake(1000);
      }

      await requestPermissions();
      navigation.navigate(IS_IOS ? 'LocationIOS' : 'AllSet');
    } catch (e) {
      // handled in service
    }
  };

  return (
    <GeneralContainer style={styles.container}>
      <OnboardingHeader />

      <View style={{ alignItems: 'center', paddingHorizontal: IS_SMALL_SCREEN ? 20 : 40, marginTop: IS_SMALL_SCREEN ? 20 : 0 }}>
        {!IS_SMALL_SCREEN && (
        <LottieView
          style={styles.lottie}
          source={require('../../assets/lottie/location.json')}
          resizeMode="cover"
          autoPlay
          loop={false}
        />
        )}

        <Text style={styles.title} bold>{title}</Text>
        <Text style={styles.subTitle}>{subTitle1}</Text>
        <Text bold>{IS_IOS ? subTitle2IOS : subTitle2Android}</Text>
      </View>

      <View style={{ alignItems: 'center' }}>
        <Animatable.View ref={animRef} style={{ marginBottom: 25, marginTop: IS_SMALL_SCREEN ? 5 : 0 }}>
          <TermsOfUse
            isRTL={isRTL}
            strings={strings}
            value={isTOUAccepted}
            onValueSelected={value => setIsTOUAccepted(value)}
            toggleWebview={() => toggleWebview(true, USAGE_ON_BOARDING)}
          />
        </Animatable.View>

        <ActionButton text={approveLocation} onPress={requestLocationPermissions} containerStyle={{ marginBottom: 20, opacity: isTOUAccepted ? 1 : 0.6 }} />
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
  lottie: {
    width: 57,
    height: 94,
    marginBottom: 20
  },
  title: {
    fontSize: 22,
    marginBottom: 25
  },
  subTitle: {
    lineHeight: 22,
    marginBottom: 25
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
    locale: { isRTL, strings }
  } = state;

  return { isRTL, strings };
};

const mapDispatchToProps = (dispatch: any) => {
  return bindActionCreators({
    toggleWebview
  }, dispatch);
};

export default connect(mapStateToProps, mapDispatchToProps)(Location);
