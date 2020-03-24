import React, { ElementType, MutableRefObject, ReactNode } from 'react';
import { StyleSheet, Text as RNText, TextProps, TextStyle } from 'react-native';
import { Fonts } from '../../types';
import { IS_SMALL_SCREEN, TEXT_COLOR } from '../../constants/Constants';

interface Props extends TextProps {
  style?: TextStyle,
  locale: 'he'|'en'|'ar'|'am'|'ru',
  reference?: MutableRefObject<any>,
  children?: ReactNode,
  bold?: boolean,
  black?: boolean,
  light?: boolean
}

const Text: ElementType = (props: Props) => {
  const { reference, children, style, bold, black, light, locale } = props;

  // TODO add fonts when relevant
  const fonts: Fonts = {
    'he-IL': bold ? 'SimplerPro_V3-Bold' : (black ? 'SimplerPro_V3-Black' : (light ? 'SimplerPro_V3-Light' : 'SimplerPro_V3-Regular'))
  };

  return (
    <RNText {...props} ref={reference} style={[styles.text, { fontFamily: fonts[locale || 'he-IL'] }, IS_SMALL_SCREEN && { lineHeight: style?.fontSize || 16 }, style]} allowFontScaling={false}>
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
