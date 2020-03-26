import React from 'react';
import { View, StyleSheet, ImageBackground } from 'react-native';
import { IS_SMALL_SCREEN, PADDING_TOP, SCREEN_HEIGHT, SCREEN_WIDTH } from '../../constants/Constants';
import { Icon, TouchableOpacity } from '.';

interface Props {
  hideClose?: boolean,
  closeModal(): void
}

const WebviewHeader = ({ hideClose, closeModal }: Props) => {
  return (
    <ImageBackground
      source={require('../../assets/main/headerBG.png')}
      style={styles.headerContainer}
      resizeMode="cover"
      resizeMethod="resize"
    >
      {
        !hideClose && (
          <TouchableOpacity style={styles.close} onPress={closeModal}>
            <Icon source={require('../../assets/onboarding/close.png')} width={IS_SMALL_SCREEN ? 20 : 31} />
          </TouchableOpacity>
        )
      }

      <View style={styles.headerSubContainer} />
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  close: {
    position: 'absolute',
    top: PADDING_TOP(IS_SMALL_SCREEN ? 10 : 20),
    left: IS_SMALL_SCREEN ? 10 : 20,
    zIndex: 1000
  },
  headerContainer: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT * 0.17,
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingTop: PADDING_TOP(0)
  },
  headerSubContainer: {
    width: SCREEN_WIDTH,
    height: 40,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    backgroundColor: '#fff'
  }
});

export { WebviewHeader };
