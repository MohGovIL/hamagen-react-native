import React, { MutableRefObject, ReactNode } from 'react';
import { StyleSheet, Text as RNText, TextProps, TextStyle, StyleProp } from 'react-native';
import { useSelector } from 'react-redux';
import { Fonts, LocaleReducer, Store } from '../../types';
import { IS_SMALL_SCREEN, TEXT_COLOR } from '../../constants/Constants';

interface Props extends TextProps {
  style?: StyleProp<TextStyle>,
  reference?: MutableRefObject<any>,
  children?: ReactNode,
  bold?: boolean,
  black?: boolean,
  light?: boolean
}

const Text = (props: Props) => {
  const { reference, children, style, bold, black, light } = props;
  const { locale } = useSelector<Store, LocaleReducer>(state => state.locale);

  // TODO add fonts when relevant
  const fonts: Fonts = {
    he: bold ? 'SimplerPro_V3-Bold' : (black ? 'SimplerPro_V3-Black' : (light ? 'SimplerPro_V3-Light' : 'SimplerPro_V3-Regular'))
  };

  return (
    <RNText {...props} ref={reference} style={[styles.text, { fontFamily: fonts[locale] || fonts.he }, IS_SMALL_SCREEN && { lineHeight: style?.fontSize || 16 }, style]} allowFontScaling={false}>
      {children}
    </RNText>
  );
};

const styles = StyleSheet.create({
  text: {
    backgroundColor: 'transparent',
    textAlign: 'center',
    fontSize: 16,
    color: TEXT_COLOR
  }
});

export { Text };
