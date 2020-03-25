import React from 'react';
import { View, StyleSheet, Modal, Linking } from 'react-native';
import { ActionButton, Icon, Text } from '.';
import { IS_IOS, IS_SMALL_SCREEN, PADDING_TOP, SCREEN_HEIGHT, SCREEN_WIDTH } from '../../constants/Constants';

interface Props {
  isVisible: boolean,
  strings: any
}

const ForceUpdate = ({ isVisible, strings: { forceUpdate: { title, desc } } }: Props) => {
  const appStoreUrl = 'https://itunes.apple.com/us/app/id1503224314?ls=1&mt=8';
  const playStoreUrl = 'https://play.google.com/store/apps/details?id=com.hamagen';

  return (
    <Modal
      visible={isVisible}
      transparent
      animationType="slide"
      onRequestClose={() => {}}
    >
      <View style={styles.container}>
        <View style={{ alignItems: 'center' }}>
          <Icon source={require('../../assets/main/noData.png')} width={115} customStyles={{ marginBottom: 25 }} />
          <Text style={styles.title} bold>{title}</Text>
          <Text style={styles.text}>{desc}</Text>
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
