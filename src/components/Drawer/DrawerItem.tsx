import React, { FunctionComponent, useMemo } from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { Icon, Text, TouchableOpacity } from '../common';
import { type } from 'os';
import * as LocalizedStyles from '../../constants/LocalizedStyles';

interface Props {
  isRTL: boolean
  icon: number
  label: Element | string
  style?: ViewStyle
  iconSize?: number
  onPress(): void
}

const DrawerItem: FunctionComponent<Props> = ({ isRTL, icon, iconSize= 18, label, style, onPress, children }) => {
  const LabelComponent = useMemo(() => {
    if (React.isValidElement(label)) {
      return label
    } else if (typeof label === 'string') {
      return <Text style={styles.label}>{label}</Text>
    }
    return null
  },[label])
  
  


  return (
    <TouchableOpacity style={[styles.container, { flexDirection: LocalizedStyles.flexDirection(isRTL) }, style]} onPress={onPress}>
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
