import React from 'react';
import { View, StyleSheet, Modal, Linking } from 'react-native';
import { ActionButton, CloseButton, Icon, Text } from '.';
import store from '../../store';
import { Strings } from '../../locale/LocaleData';
import { HIDE_FORCE_UPDATE } from '../../constants/ActionTypes';
import { IS_IOS, IS_SMALL_SCREEN, PADDING_TOP, SCREEN_HEIGHT, SCREEN_WIDTH } from '../../constants/Constants';

interface Props {
  isVisible: boolean,
  shouldForce: boolean,
  strings: Strings
}

const ForceUpdate = ({ isVisible, shouldForce, strings: { forceUpdate: { title, desc, dontForceDesc } } }: Props) => {
  const appStoreUrl = 'https://itunes.apple.com/us/app/id1503224314?ls=1&mt=8';
  const playStoreUrl = 'https://play.google.com/store/apps/details?id=com.hamagen';

  const closeModal = () => store().dispatch({ type: HIDE_FORCE_UPDATE });

  return (
    <Modal
      visible={isVisible}
      transparent
      animationType="slide"
      onRequestClose={shouldForce ? () => {} : closeModal}
    >
      <View style={styles.container}>
        {
          !shouldForce && (
            <CloseButton onPress={closeModal} />
          )
        }

        <View style={{ alignItems: 'center' }}>
          <Icon source={require('../../assets/main/noData.png')} width={115} customStyles={{ marginBottom: 25 }} />
          <Text style={styles.title} bold>{title}</Text>
          <Text style={styles.text}>{shouldForce ? desc : dontForceDesc}</Text>
        </View>

        <ActionButton text={title} onPress={() => Linking.openURL(IS_IOS ? appStoreUrl : playStoreUrl)} />
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: PADDING_TOP(IS_SMALL_SCREEN ? 40 : 70),
    paddingBottom: IS_SMALL_SCREEN ? 40 : 70,
    backgroundColor: '#fff'
  },
  title: {
    fontSize: 22,
    marginBottom: 15
  },
  text: {
    lineHeight: 20,
    paddingHorizontal: 40
  }
});

export { ForceUpdate };
