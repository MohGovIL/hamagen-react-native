import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Icon, TouchableOpacity, Text } from '.';
import { Strings } from '../../locale/LocaleData';
import { SCREEN_WIDTH, TEXT_COLOR, USAGE_ON_BOARDING } from '../../constants/Constants';

interface Props {
  isRTL: boolean,
  strings: Strings,
  value: boolean,
  onValueSelected(value: boolean): void,
  toggleWebview(isShow: boolean, usageType: string): void
}

const TermsOfUse = ({ isRTL, strings: { general: { readTOU, approveTOU }, location: { consent1, consent2 } }, value, onValueSelected, toggleWebview }: Props) => {
  return (
    <View style={[styles.container, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
      <TouchableOpacity onPress={() => onValueSelected(!value)} accessibilityLabel={approveTOU} accessibilityRole="checkbox" checked={value}>
        <View style={styles.box}>
          {value && <Icon source={require('../../assets/onboarding/checked.png')} height={8} width={12} customStyles={{ tintColor: TEXT_COLOR }} />}
        </View>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => toggleWebview(true, USAGE_ON_BOARDING)} accessibilityHint={readTOU}>
        <Text style={{ paddingHorizontal: 10, textAlign: isRTL ? 'right' : 'left' }}>
          <Text style={[styles.text]}>{consent1}</Text>
          <Text style={[styles.text, { textDecorationLine: 'underline' }]}>{consent2}</Text>
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: SCREEN_WIDTH,
    paddingHorizontal: 60,
    alignItems: 'center'
  },
  box: {
    width: 20,
    height: 20,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderColor: TEXT_COLOR
  },
  text: {
    fontSize: 14,
    color: TEXT_COLOR
  }
});

export { TermsOfUse };
