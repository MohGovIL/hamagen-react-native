import React, { ElementType } from 'react';
import { StyleSheet } from 'react-native';
import { connect } from 'react-redux';
import { TouchableOpacity, Icon } from '.';
import { Strings } from '../../locale/LocaleData';
import { PADDING_TOP } from '../../constants/Constants';

interface Props {
  strings: Strings,
  isSmall?: boolean,
  onPress(): void
}

let CloseButton: ElementType = ({ strings: { general: { close } }, isSmall, onPress }: Props) => {
  return (
    <TouchableOpacity
      style={[styles.close, { top: PADDING_TOP(isSmall ? 10 : 20), left: isSmall ? 10 : 20 }]}
      onPress={onPress}
      importantForAccessibility="no-hide-descendants"
      accessibilityElementsHidden
      accessibilityLabel={close}
    >
      <Icon source={require('../../assets/onboarding/close.png')} width={isSmall ? 20 : 31} />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  close: {
    position: 'absolute',
    zIndex: 1000
  }
});

const mapStateToProps = (state: any) => {
  const {
    locale: { strings }
  } = state;

  return { strings };
};

CloseButton = connect(mapStateToProps, null)(CloseButton);

export { CloseButton };
