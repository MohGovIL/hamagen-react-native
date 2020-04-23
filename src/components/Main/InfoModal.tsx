import React, {useState,useMemo, useImperativeHandle} from 'react';
import { View,ImageBackground,TouchableWithoutFeedback, StyleSheet,Modal } from 'react-native';
import moment from 'moment';
import { Text, Icon, TouchableOpacity} from '../common';
import { HIT_SLOP, SCREEN_WIDTH } from '../../constants/Constants';
import { Strings } from '../../locale/LocaleData';


const MODAL_MARGIN = 26

interface InfoModalProps {
    strings: Strings,
    showModal: boolean,
    firstPointDate: string,
    closeModal(): void
}

const InfoModal = ({strings,firstPointDate,closeModal,showModal}: InfoModalProps) => {

    const {
        scanHome: {
            noExposures:{
                infoModal: {
                    textBodyPt1,
                    textBodyPt2
                }
            }
        } 
    } = strings
    
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
                <View style={[styles.closeBtnContainer]}>
                    <TouchableOpacity hitSlop={HIT_SLOP} onPress={closeModal}>
                        <Icon source={require('../../assets/onboarding/close.png')} width={19}/>
                    </TouchableOpacity>
                </View>
                <View style={styles.bodyContainer}>
                    <Icon 
                        source={require('../../assets/main/moreInfoBig.png')} 
                        width={31} 
                        customStyles={styles.infoIcon}
                    />
                    <Text >
                        <Text style={styles.infoText} >{textBodyPt1.trim()}</Text>
                        <Text style={styles.infoText} bold>{` ${firstPointDate} `}</Text>
                        <Text style={styles.infoText} >{textBodyPt2.trim()}</Text>
                    </Text>
                    </View>
                </View>
            </ImageBackground>
            </TouchableWithoutFeedback>
        </Modal>
    )
}


const styles = StyleSheet.create({
    imageContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    container: {
        height: 261,
        backgroundColor: 'white', 
        justifyContent: 'center', 
        alignItems: 'center',
        borderRadius: 18,
        shadowColor: '#084473',
        shadowOffset: { width: 0, height: 9 },
        shadowOpacity: 0.1,
        shadowRadius: 23,
        elevation: 5,
        width: SCREEN_WIDTH - (MODAL_MARGIN*2)
    },
    closeBtnContainer: {
        flex: 1,
        paddingLeft: 14,
        justifyContent: 'center',
        alignItems: 'flex-start',
        width: SCREEN_WIDTH - (MODAL_MARGIN*2)
    },
    bodyContainer: {
        flex: 3,
        paddingHorizontal: 57,
        alignItems: 'center',
        marginBottom: 40,
        marginTop: 20
    },
    infoIcon: {
        marginBottom: 18
    },
    infoText: {
        fontSize: 16
    }

})


export default InfoModal