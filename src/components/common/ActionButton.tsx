import React from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import { Text, TouchableOpacity } from '.';
import { SCREEN_WIDTH, MAIN_COLOR, BASIC_SHADOW_STYLES } from '../../constants/Constants';

interface Props {
  text: string,
  isDisabled?: boolean,
  textColor?: string,
  containerStyle?: ViewStyle,
  onPress(): void
}

const ActionButton = ({ onPress, text, isDisabled, textColor = '#fff', containerStyle }: Props) => {
  return (
    <TouchableOpacity onPress={onPress} disabled={isDisabled}>
      <View style={[styles.container, isDisabled && { opacity: 0.6 }, containerStyle]}>
        <Text style={{ ...styles.text, color: textColor }} black>{text}</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    ...BASIC_SHADOW_STYLES,
    width: SCREEN_WIDTH * 0.6,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    backgroundColor: MAIN_COLOR
  },
  text: {
    maxWidth: SCREEN_WIDTH * 0.58,
    fontSize: 20
  }
});

export { ActionButton };
