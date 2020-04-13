import React, { ElementType } from 'react';
import { View, StyleSheet } from 'react-native';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { Icon, TouchableOpacity, Text } from '.';
import { toggleChangeLanguage } from '../../actions/LocaleActions';
import { Languages, Strings } from '../../locale/LocaleData';

interface Props {
  locale: string,
  languages: Languages,
  strings: Strings,
  toggleChangeLanguage(isShow: boolean): void
}

let ChangeLanguageButton: ElementType = ({ locale, strings: { languages: { title } }, languages: { short, long }, toggleChangeLanguage }: Props) => {
  return (
    <TouchableOpacity
      onPress={() => toggleChangeLanguage(true)}
      importantForAccessibility="no-hide-descendants"
      accessibilityElementsHidden
      accessibilityHint={long[locale]}
      accessibilityLabel={title}
    >
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
    locale: { locale, languages, strings }
  } = state;

  return { locale, languages, strings };
};

const mapDispatchToProps = (dispatch: any) => {
  return bindActionCreators({
    toggleChangeLanguage
  }, dispatch);
};

ChangeLanguageButton = connect(mapStateToProps, mapDispatchToProps)(ChangeLanguageButton);

export { ChangeLanguageButton };
