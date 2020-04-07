import React, { ElementType } from 'react';
import { View, StyleSheet } from 'react-native';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { Icon, TouchableOpacity, Text } from '.';
import { toggleChangeLanguage } from '../../actions/LocaleActions';
import { Languages } from '../../locale/LocaleData';

interface Props {
  locale: string,
  languages: Languages,
  toggleChangeLanguage(isShow: boolean): void
}

let ChangeLanguageButton: ElementType = ({ locale, languages: { short }, toggleChangeLanguage }: Props) => {
  return (
    <TouchableOpacity onPress={() => toggleChangeLanguage(true)}>
      <View style={styles.container}>
        <Text style={styles.text}>{short[locale]}</Text>
        <Icon source={require('../../assets/onboarding/lang.png')} width={20} />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row'
  },
  text: {
    fontSize: 17,
    marginRight: 5
  }
});

const mapStateToProps = (state: any) => {
  const {
    locale: { locale, languages }
  } = state;

  return { locale, languages };
};

const mapDispatchToProps = (dispatch: any) => {
  return bindActionCreators({
    toggleChangeLanguage
  }, dispatch);
};

ChangeLanguageButton = connect(mapStateToProps, mapDispatchToProps)(ChangeLanguageButton);

export { ChangeLanguageButton };
