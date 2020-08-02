import React from 'react';
import { StyleSheet } from 'react-native';
import { useSelector } from 'react-redux';
import { TouchableOpacity, Icon } from '.';
import { LocaleReducer, Store } from '../../types';
import { IS_SMALL_SCREEN, PADDING_TOP, HIT_SLOP } from '../../constants/Constants';
import * as LocalizedStyles from '../../constants/LocalizedStyles';

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
        [LocalizedStyles.side(isRTL, true)]: IS_SMALL_SCREEN ? 10 : 20,
        transform: [{ rotate: LocalizedStyles.rotateDegree(isRTL) }]
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
