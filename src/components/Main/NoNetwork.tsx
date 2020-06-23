import React from 'react';
import { StyleSheet, View, Linking, Platform } from 'react-native';
import RNIntents from 'react-native-common-intents';
import { FadeInView, Icon, Text, TouchableOpacity } from '../common';
import { IS_SMALL_SCREEN, MAIN_COLOR } from '../../constants/Constants';

interface Props {
  title: string,
  description: string,
  button: string
}

const NoNetwork = ({ title, description, button }: Props) => {
  // open settings
  const handlePressIOS = () => Linking.openURL('App-Prefs:root=WIFI');
  const handlePressAndroid = () => RNIntents.openWifiSettings();

  return (
    <FadeInView style={styles.container}>
      <Icon source={require('../../assets/main/noData.png')} width={IS_SMALL_SCREEN ? 80 : 113} height={IS_SMALL_SCREEN ? 100 : 143} />

      <View>
        <Text style={[styles.text, { fontSize: 22 }]} bold>{title}</Text>
        <Text style={styles.text}>{description}</Text>
      </View>
      <TouchableOpacity onPress={Platform.select({
        ios: handlePressIOS,
        android: handlePressAndroid
      })}
      >
        <Text>{button}</Text>
        <View style={{ height: 2, backgroundColor: MAIN_COLOR, marginTop: 2 }} />
      </TouchableOpacity>

      <View />
    </FadeInView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: 50
  },
  text: {
    marginBottom: 20,
    lineHeight: 20
  }
});

export default NoNetwork;
