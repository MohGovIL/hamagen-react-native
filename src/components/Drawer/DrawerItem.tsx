import React, { FunctionComponent } from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { Icon, Text, TouchableOpacity } from '../common';
import { type } from 'os';

interface Props {
  isRTL: boolean
  icon: number
  label: Element | string
  style?: ViewStyle
  iconSize?: number
  onPress(): void
}

const DrawerItem: FunctionComponent<Props> = ({ isRTL, icon, iconSize= 18, label, style, onPress, children }) => {
  let LabelComponent = null
  if (React.isValidElement(label)) {
    LabelComponent = label
  } else if (typeof label === 'string') {
    LabelComponent = <Text style={styles.label}>{label}</Text>
  }


  return (
    <TouchableOpacity style={[styles.container, { flexDirection: isRTL ? 'row-reverse' : 'row' }, style]} onPress={onPress}>
      <Icon source={icon} width={iconSize} />
      {LabelComponent}
    </TouchableOpacity>

  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 25,
    paddingVertical: 24,
    alignItems: 'center',
    borderBottomColor: 'white',
    borderBottomWidth: 1.5
  },
  label: {
    fontSize: 18,
    paddingHorizontal: 19
  }
});

export default DrawerItem;
