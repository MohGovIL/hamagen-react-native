import React from 'react';
import { StyleSheet } from 'react-native';
import { useSelector } from 'react-redux';
import { Icon, TouchableOpacity } from '.';
import { HIT_SLOP, IS_SMALL_SCREEN, PADDING_TOP } from '../../constants/Constants';
import { LocaleReducer, Store } from '../../types';

interface Props {
  type?: 'close'|'back',
  onPress(): void
}

const HeaderButton = ({ type = 'back', onPress }: Props) => {
  const { isRTL, strings: { general: { close } } } = useSelector<Store, LocaleReducer>(state => state.locale);

  return (
    <TouchableOpacity
      hitSlop={HIT_SLOP}
      style={[styles.close, {
        top: PADDING_TOP(IS_SMALL_SCREEN ? 10 : 20),
        [!isRTL ? 'right' : 'left']: IS_SMALL_SCREEN ? 10 : 20,
        transform: [{ rotate: !isRTL ? '0deg' : '180deg' }]
      }]}
      onPress={onPress}
      importantForAccessibility="no-hide-descendants"
      accessibilityElementsHidden
      accessibilityLabel={close}
    >
      <Icon source={type === 'close' ? require('../../assets/onboarding/close.png') : require('../../assets/main/back.png')} width={IS_SMALL_SCREEN ? 20 : 31} />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  close: {
    position: 'absolute',
    zIndex: 1000
  }
});

export { HeaderButton };
