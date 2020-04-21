import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import ChangeLanguage from './ChangeLanguage';
import { Icon } from '../common';
import { PADDING_TOP, IS_SMALL_SCREEN, MAIN_COLOR, SCREEN_HEIGHT, SCREEN_WIDTH, HIT_SLOP } from '../../constants/Constants';

interface Props {
  navigation: StackNavigationProp<any>
}

const ChangeLanguageScreen = ({ navigation }: Props) => {
  return (
    <View style={styles.container}>
      <View
        style={[{
          position: 'absolute',
          zIndex: 1000,
          top: PADDING_TOP(IS_SMALL_SCREEN ? 10 : 20),
          right: IS_SMALL_SCREEN ? 10 : 20
        }]}
      >
        <TouchableOpacity
          hitSlop={HIT_SLOP}
          onPress={navigation.goBack}
          importantForAccessibility="no-hide-descendants"
          accessibilityElementsHidden
          accessibilityLabel="go back"
        >
          <Icon source={require('../../assets/main/back.png')} width={IS_SMALL_SCREEN ? 20 : 31} />
        </TouchableOpacity>
      </View>

      <ChangeLanguage toggleChangeLanguage={() => navigation.pop()} />
    </View>
  );
};


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff'
  },
  titleWrapper: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT * 0.2,
    paddingTop: SCREEN_HEIGHT * 0.1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  title: {
    fontSize: 22,
    marginBottom: 30
  },
  languageButton: {
    width: SCREEN_WIDTH * 0.75,
    height: IS_SMALL_SCREEN ? 50 : 70,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 22,
    borderRadius: 7,
    borderWidth: 1,
    borderColor: MAIN_COLOR
  },
  text: {
    fontSize: 15
  }
});


export default ChangeLanguageScreen;
