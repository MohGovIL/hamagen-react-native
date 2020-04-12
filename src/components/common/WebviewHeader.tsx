import React from 'react';
import { View, StyleSheet, ImageBackground } from 'react-native';
import { CloseButton } from '.';
import { IS_SMALL_SCREEN, PADDING_TOP, SCREEN_HEIGHT, SCREEN_WIDTH } from '../../constants/Constants';

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
          <CloseButton isSmall={IS_SMALL_SCREEN} onPress={closeModal} />
        )
      }

      <View style={styles.headerSubContainer} />
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
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
