import React, { ElementType } from 'react';
import { View, StyleSheet, Modal } from 'react-native';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { Icon, Text, TouchableOpacity } from '.';
import { changeLocale, toggleChangeLanguage } from '../../actions/LocaleActions';
import { IS_SMALL_SCREEN, MAIN_COLOR, PADDING_TOP, SCREEN_HEIGHT, SCREEN_WIDTH } from '../../constants/Constants';

interface Props {
  isVisible: boolean,
  strings: any,
  locale: 'he'|'en'|'ar'|'am'|'ru'|'fr',
  changeLocale(locale: 'he'|'en'|'ar'|'am'|'ru'|'fr'): void,
  toggleChangeLanguage(isShow: boolean): void
}

let ChangeLanguage: ElementType = ({ isVisible, locale, strings: { languages: { title, long } }, changeLocale, toggleChangeLanguage }: Props) => {
  const onButtonPress = (selectedLocale: 'he'|'en'|'ar'|'am'|'ru'|'fr') => {
    selectedLocale !== locale && changeLocale(selectedLocale);
    toggleChangeLanguage(false);
  };

  return (
    <Modal
      visible={isVisible}
      animationType="slide"
      transparent
      onRequestClose={() => toggleChangeLanguage(false)}
    >
      <View style={styles.container}>
        <TouchableOpacity style={styles.close} onPress={() => toggleChangeLanguage(false)}>
          <Icon source={require('../../assets/onboarding/close.png')} width={31} />
        </TouchableOpacity>

        <Text style={styles.title} bold>{title}</Text>

        {
          Object.keys(long).map((key: string, index: number) => (
            <TouchableOpacity key={index} onPress={() => onButtonPress(key)}>
              <View style={[styles.languageButton, key === locale && { backgroundColor: MAIN_COLOR }]}>
                <Text style={[styles.text, key === locale && { color: '#fff' }]} black>{long[key]}</Text>
              </View>
            </TouchableOpacity>
          ))
        }
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff'
  },
  close: {
    position: 'absolute',
    top: PADDING_TOP(20),
    left: 20,
    zIndex: 1000
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

const mapStateToProps = (state: any) => {
  const {
    locale: { strings, locale }
  } = state;

  return { strings, locale };
};

const mapDispatchToProps = (dispatch: any) => {
  return bindActionCreators({
    changeLocale,
    toggleChangeLanguage
  }, dispatch);
};

ChangeLanguage = connect(mapStateToProps, mapDispatchToProps)(ChangeLanguage);

export { ChangeLanguage };
