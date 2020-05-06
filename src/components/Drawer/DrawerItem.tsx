import * as React from 'react';
import { View, StyleSheet } from 'react-native';
import { Icon, Text, TouchableOpacity } from '../common';

interface Props {
  isRTL: boolean,
  icon: number,
  label: string,
  onPress(): void
}

const DrawerItem = ({ isRTL, icon, label, onPress }: Props) => {
  return (
    <View style={{ borderBottomColor: 'white', borderBottomWidth: 1.5 }}>
      <TouchableOpacity style={[styles.container, { flexDirection: isRTL ? 'row-reverse' : 'row' }]} onPress={onPress}>
        <Icon source={icon} width={18} />
        <Text style={styles.label}>{label}</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 25,
    paddingVertical: 24,
    alignItems: 'center'
  },
  label: {
    fontSize: 18,
    paddingHorizontal: 19
  }
});

export default DrawerItem;
