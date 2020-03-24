import React, { useRef, useState } from 'react';
import { View, StyleSheet, Modal } from 'react-native';
import * as Animatable from 'react-native-animatable';
import { ActionButton, Icon, TermsOfUse, Text } from '.';
import { IS_SMALL_SCREEN, PADDING_TOP, SCREEN_HEIGHT, SCREEN_WIDTH } from '../../constants/Constants';

interface Props {
  isRTL: boolean,
  strings: any,
  isVisible: boolean,
  onSeeTerms(): void,
  onApprovedTerms(): void
}

const ForceTerms = ({ isVisible, isRTL, strings, onSeeTerms, onApprovedTerms }: Props) => {
  const animRef = useRef<any>(null);
  const [isTOUAccepted, setIsTOUAccepted] = useState(false);

  const { forceTerms: { title, desc, approve } } = strings;

  const onPress = () => {
    if (!isTOUAccepted) {
      animRef.current.shake(1000);
    } else {
      onApprovedTerms();
    }
  };

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

        <View style={{ alignItems: 'center' }}>
          <Animatable.View ref={animRef} style={{ marginBottom: 25 }}>
            <TermsOfUse
              isRTL={isRTL}
              strings={strings}
              value={isTOUAccepted}
              onValueSelected={value => setIsTOUAccepted(value)}
              toggleWebview={onSeeTerms}
            />
          </Animatable.View>

          <ActionButton text={approve} onPress={onPress} containerStyle={{ marginBottom: 20, opacity: isTOUAccepted ? 1 : 0.6 }} />
        </View>
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

export { ForceTerms };
