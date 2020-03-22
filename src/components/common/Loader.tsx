import React from 'react';
import { StyleSheet, Modal, View, ActivityIndicator } from 'react-native';
import { BACK_DROP_COLOR, SCREEN_HEIGHT, SCREEN_WIDTH } from '../../constants/Constants';

interface Props {
  isVisible: boolean
}

const Loader = ({ isVisible }: Props) => {
  return (
    <Modal
      visible={isVisible}
      animationType="fade"
      transparent
      onRequestClose={() => {}}
    >
      <View style={styles.backdrop}>
        <ActivityIndicator size="large" />
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: BACK_DROP_COLOR
  }
});

export { Loader };
