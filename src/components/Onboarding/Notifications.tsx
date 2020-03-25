import React from 'react';
import { View, StyleSheet } from 'react-native';
import { connect } from 'react-redux';
import LottieView from 'lottie-react-native';
import { ActionButton, GeneralContainer, OnboardingHeader, Text } from '../common';
import { initPushNotifications } from '../../services/PushService';
import { IS_SMALL_SCREEN } from '../../constants/Constants';

interface Props {
  navigation: any,
  strings: any
}

const Notifications = ({ navigation, strings: { notifications: { title, subTitle1, subTitle2, approveNotifications } } }: Props) => {
  const requestNotificationsPermissions = async () => {
    try {
      await initPushNotifications();
      navigation.navigate('AllSet');
    } catch (e) {
      // handled in service
    }
  };

  return (
    <GeneralContainer style={styles.container}>
      <OnboardingHeader />

      <View style={[{ alignItems: 'center', paddingHorizontal: 40 }, IS_SMALL_SCREEN && { paddingTop: 5 }]}>
        {!IS_SMALL_SCREEN && (
        <LottieView
          style={styles.lottie}
          source={require('../../assets/lottie/notifications.json')}
          resizeMode="cover"
          autoPlay
          loop={false}
        />
        )}

        <Text style={styles.title} bold>{title}</Text>
        <Text style={styles.subTitle}>{subTitle1}</Text>
        <Text bold>{subTitle2}</Text>
      </View>

      <ActionButton text={approveNotifications} onPress={requestNotificationsPermissions} containerStyle={{ marginBottom: 20 }} />
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
    height: 120,
    marginBottom: 20
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

export default connect(mapStateToProps, null)(Notifications);
