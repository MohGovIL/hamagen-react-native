import React from 'react';
import { View, StyleSheet, Modal } from 'react-native';
import { connect } from 'react-redux';
import ChangeLanguage from './ChangeLanguage';
import { CloseButton } from '../common';
import { toggleChangeLanguage } from '../../actions/LocaleActions';
import { IS_SMALL_SCREEN, MAIN_COLOR, SCREEN_HEIGHT, SCREEN_WIDTH } from '../../constants/Constants';

interface Props {
    isVisible: boolean,
    toggleChangeLanguage(isShow: boolean): void
}

const ChangeLanguageModal = ({ isVisible, toggleChangeLanguage }: Props) => {
  return (
    <Modal
      visible={isVisible}
      animationType="slide"
      transparent
      onRequestClose={() => toggleChangeLanguage(false)}
    >
      <View style={styles.container}>
        <CloseButton onPress={() => toggleChangeLanguage(false)} />
        <ChangeLanguage toggleChangeLanguage={toggleChangeLanguage} />
      </View>

    </Modal>
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


export default connect(null, { toggleChangeLanguage })(ChangeLanguageModal);
