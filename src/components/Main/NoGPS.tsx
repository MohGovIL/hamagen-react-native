import React from 'react';
import { StyleSheet, View, Linking, Platform } from 'react-native';
// @ts-ignore
import RNSettings from 'react-native-settings';
import { FadeInView, Icon, Text, TouchableOpacity } from '../common';
import { IS_SMALL_SCREEN, MAIN_COLOR } from '../../constants/Constants';

interface Props {
  title: string,
  description: string,
  button: string
}

const NoGPS = ({ title, description, button }: Props) => {
  // open settings IOS
  const handlePressIOS = () => Linking.openURL('App-prefs:root=Privacy&path=LOCATION');
  // open Location settings Android
  const handlePressAndroid = () => {
    RNSettings.openSetting(RNSettings.ACTION_LOCATION_SOURCE_SETTINGS);
  };
  
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
        <Text style={{ fontSize: 16, paddingHorizontal: 5 }} bold>{button}</Text>
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

export default NoGPS;
