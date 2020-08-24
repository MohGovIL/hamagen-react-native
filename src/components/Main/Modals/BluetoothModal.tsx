import React from 'react';
import { StyleSheet, View } from 'react-native';
import { IS_SMALL_SCREEN, PADDING_BOTTOM, PADDING_TOP } from '../../../constants/Constants';
import { initBLETracing } from '../../../services/BLEService';
import { HeaderButton } from '../../common';
import BluetoothPermission from '../../common/BluetoothPermission';

const BluetoothModal = ({ navigation }) => {
  const handleExit = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    }
  };

  return (
    <View style={styles.container}>
      <HeaderButton type="close" onPress={handleExit} />
      <BluetoothPermission
        onEnd={() => {
          navigation.goBack();
          // user agreed so start service
          initBLETracing();
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: PADDING_TOP(IS_SMALL_SCREEN ? 10 : 92),
    paddingBottom: PADDING_BOTTOM(IS_SMALL_SCREEN ? 10 : 77)
  },
});

export default BluetoothModal;
