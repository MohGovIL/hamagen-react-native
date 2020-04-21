import React, { ElementType } from 'react';
import { View, StyleSheet, Modal, ScrollView } from 'react-native';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { Text, TouchableOpacity } from '../common';
import { changeLocale } from '../../actions/LocaleActions';
import { Languages, Strings } from '../../locale/LocaleData';
import { IS_SMALL_SCREEN, MAIN_COLOR, SCREEN_HEIGHT, SCREEN_WIDTH } from '../../constants/Constants';

interface Props {
  isVisible: boolean,
  strings: Strings,
  locale: string,
  languages: Languages,
  changeLocale(locale: string): void,
  toggleChangeLanguage(isShow: boolean): void
}

let ChangeLanguage: ElementType = ({ isVisible, locale, strings: { languages: { title } }, languages: { long }, changeLocale, toggleChangeLanguage }: Props) => {
  const onButtonPress = (selectedLocale: string) => {
    selectedLocale !== locale && changeLocale(selectedLocale);
    toggleChangeLanguage(false);
  };

  return (
    <>
      <View style={styles.titleWrapper}>
        <Text style={styles.title} bold>{title}</Text>
      </View>

      <ScrollView
        contentContainerStyle={{ alignItems: 'center' }}
        showsVerticalScrollIndicator={false}
      >
        {
            Object.keys(long).map((key: string, index: number) => (
              <TouchableOpacity key={index} onPress={() => onButtonPress(key)}>
                <View style={[styles.languageButton, key === locale && { backgroundColor: MAIN_COLOR }]}>
                  <Text style={[styles.text, key === locale && { color: '#fff' }]} black>{long[key]}</Text>
                </View>
              </TouchableOpacity>
            ))
          }
      </ScrollView>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
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

const mapStateToProps = (state: any) => {
  const {
    locale: { strings, locale, languages }
  } = state;

  return { strings, locale, languages };
};

const mapDispatchToProps = (dispatch: any) => {
  return bindActionCreators({
    changeLocale,
  }, dispatch);
};

ChangeLanguage = connect(mapStateToProps, mapDispatchToProps)(ChangeLanguage);

export default ChangeLanguage;
