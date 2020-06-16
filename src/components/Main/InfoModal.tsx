import React, { useState, useMemo, useImperativeHandle } from 'react';
import { View, ImageBackground, TouchableWithoutFeedback, StyleSheet, Modal } from 'react-native';
import moment from 'moment';
import { Text, Icon, TouchableOpacity } from '../common';
import { HIT_SLOP, SCREEN_WIDTH } from '../../constants/Constants';
import { Strings } from '../../locale/LocaleData';


const MODAL_MARGIN = 26;

interface InfoModalProps {
  strings: Strings,
  showModal: boolean,
  firstPointDate: string,
  closeModal(): void
}

const InfoModal = ({ strings, firstPointDate, closeModal, showModal }: InfoModalProps) => {
  const {
    scanHome: {
      noExposures: {
        infoModal: {
          textBodyPt1,
          textBodyPt2
        }
      }
    }
  } = strings;

  return (
    <Modal
      animationType="fade"
      onRequestClose={closeModal}
      visible={showModal}
    >
      <TouchableWithoutFeedback onPress={closeModal}>
        <ImageBackground
          resizeMode="cover"
          style={styles.imageContainer}
          source={require('../../assets/main/infoModalBG.png')}
        >
          <View style={[styles.container]}>
            <TouchableOpacity style={styles.closeBtnContainer} hitSlop={HIT_SLOP} onPress={closeModal}>
              <Icon source={require('../../assets/onboarding/close.png')} width={19} />
            </TouchableOpacity>
            <Icon
              source={require('../../assets/main/moreInfoBig.png')}
              width={31}
              customStyles={styles.infoIcon}
            />
            <Text>
              <Text style={styles.infoText}>{textBodyPt1.trim()}</Text>
              <Text style={styles.infoText} bold>{` ${firstPointDate} `}</Text>
              <Text style={styles.infoText}>{textBodyPt2.trim()}</Text>
            </Text>
          </View>
        </ImageBackground>
      </TouchableWithoutFeedback>
    </Modal>
  );
};


const styles = StyleSheet.create({
  imageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  container: {
    width: SCREEN_WIDTH - (MODAL_MARGIN * 2),
    alignItems: 'center',
    borderRadius: 18,
    shadowColor: '#084473',
    shadowOffset: { width: 0, height: 9 },
    shadowOpacity: 0.1,
    shadowRadius: 23,
    elevation: 5,
    paddingHorizontal: 57,
    paddingBottom: 40,
    paddingTop: 20,
    backgroundColor: 'white',
  },
  closeBtnContainer: {
    position: 'absolute',
    top: 14,
    left: 14,
  },
  infoIcon: {
    marginBottom: 18
  },
  infoText: {
    fontSize: 16
  }
});


export default InfoModal;
