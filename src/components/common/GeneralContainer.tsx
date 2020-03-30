import React, { ReactNode } from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { MAIN_COLOR, PADDING_BOTTOM, PADDING_TOP } from '../../constants/Constants';

interface Props {
  children?: ReactNode,
  style?: ViewStyle
}

const GeneralContainer = ({ children, style }: Props) => {
  return (
    <View style={styles.container}>
      <View style={[styles.subContainer, style]}>
        {children}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: PADDING_TOP(20),
    paddingBottom: PADDING_BOTTOM(20),
    backgroundColor: MAIN_COLOR
  },
  subContainer: {
    flex: 1,
    alignSelf: 'stretch',
    alignItems: 'center',
    paddingTop: 50,
    paddingBottom: 20,
    borderRadius: 30,
    backgroundColor: '#fff'
  }
});

export { GeneralContainer };
