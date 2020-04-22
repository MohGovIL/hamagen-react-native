import React from 'react';
import { View, StyleSheet } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import ChangeLanguage from './ChangeLanguage';
import { HeaderButton } from '../common';

interface Props {
  navigation: StackNavigationProp<any>
}

const ChangeLanguageScreen = ({ navigation }: Props) => {
  return (
    <View style={styles.container}>
      <HeaderButton type="back" onPress={navigation.goBack} />
      <ChangeLanguage toggleChangeLanguage={() => navigation.pop()} />
    </View>
  );
};


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff'
  }
});


export default ChangeLanguageScreen;
