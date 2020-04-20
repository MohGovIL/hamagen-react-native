import React, {useState,useEffect, useImperativeHandle} from 'react';
import { View,ImageBackground,TouchableWithoutFeedback, StyleSheet,Modal, useWindowDimensions } from 'react-native';
import {  Text, Icon, TouchableOpacity} from '../common';

const InfoModal = React.forwardRef((props,ref) => {
    const [modalVisible, setModalVisibility] = useState(false)
    const windowWidth = useWindowDimensions().width

    const toggleModal = () => {
        setModalVisibility(!modalVisible)
    }
    useImperativeHandle(ref,() => ({
        openModal: () => setModalVisibility(true),
        closeModal: () => setModalVisibility(false),
        isInfoModalOpen: () => modalVisible,
        toggleModal,
    }))

    return (
        <Modal
            onRequestClose={toggleModal}
            animationType="fade"
            visible={modalVisible}>
                <TouchableWithoutFeedback onPress={()=> setModalVisibility(false)}>
            <ImageBackground
                resizeMode="cover"
                source={require('../../assets/main/infoModalBG.png')} 
                style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}
                
            >
                <View 
                    style={{
                        height: 240,
                        backgroundColor: 'white', 
                        width: windowWidth - (26*2),
                        justifyContent: 'center', 
                        alignItems: 'center',
                        borderRadius: 18,
                        shadowColor: '#084473',
                        shadowOffset: { width: 0, height: 9 },
                        shadowOpacity: 0.1,
                        shadowRadius: 23,
                        elevation: 5,
                    }}>
                <View style={{flex: 1,paddingLeft: 14, justifyContent: 'center', alignItems: 'flex-start',width: windowWidth - (26*2)}}>
                    <TouchableOpacity hitSlop={{top: 10, right: 10, left: 10, bottom: 10}} onPress={toggleModal}>
                        <Icon source={require('../../assets/onboarding/close.png')} width={16}/>
                    </TouchableOpacity>
                </View>
                <View style={{flex: 3, paddingHorizontal: 57, alignItems: 'center', marginBottom: 40,marginTop: 20}}>
                    <Icon source={require('../../assets/main/moreInfoBig.png')} width={31} customStyles={{marginBottom: 18}}/>
                    <Text>ההשוואה מבוצעת מרגע קבלת המיקומים שלך בתאריך 03.3.20 אל מול נתוני המיקומים של כל החולים המאומתים בארץ עבור 14 הימים האחרונים, ומתעדכנת כל הזמן
                    </Text>
                    </View>
                </View>
            </ImageBackground>
            </TouchableWithoutFeedback>
        </Modal>
    )
})


export default InfoModal