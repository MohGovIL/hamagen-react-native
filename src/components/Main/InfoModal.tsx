import React, {useState,useMemo, useImperativeHandle} from 'react';
import { View,ImageBackground,TouchableWithoutFeedback, StyleSheet,Modal, useWindowDimensions } from 'react-native';
import moment from 'moment';
import { Text, Icon, TouchableOpacity} from '../common';
import { HIT_SLOP } from '../../constants/Constants';
import { Strings } from 'src/locale/LocaleData';

const MODAL_MARGIN = 26

export interface InfoModalTypes {
    openModal(): void,
    closeModal(): void,
    toggleModal(): void
    isModalOpen(): boolean,
}

interface InfoModalProps {
    strings: Strings,
    firstPoint?: number
}

const InfoModal = React.forwardRef(({strings,firstPoint}: InfoModalProps,ref) => {
    const [modalVisible, setModalVisibility] = useState(false)
    const FPDate = useMemo(() => moment(firstPoint).format('D.M.YY'),[firstPoint])
    const windowWidth = useWindowDimensions().width

    const toggleModal = () => {
        setModalVisibility(!modalVisible)
    }

    useImperativeHandle(ref,() => ({
        openModal: () => setModalVisibility(true),
        closeModal: () => setModalVisibility(false),
        isModalOpen: () => modalVisible,
        toggleModal,
    }))

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
            onRequestClose={toggleModal}
            animationType="fade"
            visible={modalVisible}>
            <TouchableWithoutFeedback onPress={toggleModal}>
            <ImageBackground
                resizeMode="cover"
                source={require('../../assets/main/infoModalBG.png')} 
                style={styles.imageContainer}
                
            >
                <View 
                    style={[styles.container,{width: windowWidth - (MODAL_MARGIN*2)}]}>
                <View style={[styles.closeBtnContainer,{width: windowWidth - (MODAL_MARGIN*2)}]}>
                    <TouchableOpacity hitSlop={HIT_SLOP} onPress={toggleModal}>
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
                        <Text style={styles.infoText} bold>{` ${FPDate} `}</Text>
                        <Text style={styles.infoText} >{textBodyPt2.trim()}</Text>
                    </Text>
                    </View>
                </View>
            </ImageBackground>
            </TouchableWithoutFeedback>
        </Modal>
    )
})
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
    },
    closeBtnContainer: {
        flex: 1,
        paddingLeft: 14,
        justifyContent: 'center',
        alignItems: 'flex-start',
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