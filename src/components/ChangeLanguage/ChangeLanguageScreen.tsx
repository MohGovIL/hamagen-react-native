import React, { ElementType } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { PADDING_TOP,isSmall,IS_SMALL_SCREEN, MAIN_COLOR, SCREEN_HEIGHT, SCREEN_WIDTH, HIT_SLOP } from '../../constants/Constants';
import ChangeLanguage from './ChangeLanguage'
import { Icon } from '../common'
interface Props {
    isVisible: boolean,
    navigation: any,
    toggleChangeLanguage(isShow: boolean): void
}
const ChangeLanguageScreen = ({navigation}: Props) => {
    return (
    <View style={styles.container}>
        <View 
            style={[{ 
                position: 'absolute',
                zIndex: 1000,
                top: PADDING_TOP(isSmall ? 10 : 20),
                right: isSmall ? 10 : 20
            }]} >

            <TouchableOpacity
            hitSlop={HIT_SLOP}
            onPress={navigation.goBack}
            importantForAccessibility="no-hide-descendants"
            accessibilityElementsHidden
            accessibilityLabel={'go back'}
            >
                <Icon source={require('../../assets/main/back.png')} width={isSmall ? 20 : 31} />
            </TouchableOpacity>
    </View>
    <ChangeLanguage toggleChangeLanguage={navigation.back} />
  </View>)
}


const styles = StyleSheet.create({
    container: {
      flex:1,
      backgroundColor: '#fff'
    },
    titleWrapper: {
      width: SCREEN_WIDTH,
      height: SCREEN_HEIGHT * 0.2,
      paddingTop: SCREEN_HEIGHT * 0.1,
      justifyContent: 'center',
      alignItems: 'center'
    },
    title: {
      fontSize: 22,
      marginBottom: 30
    },
    languageButton: {
      width: SCREEN_WIDTH * 0.75,
      height: IS_SMALL_SCREEN ? 50 : 70,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 22,
      borderRadius: 7,
      borderWidth: 1,
      borderColor: MAIN_COLOR
    },
    text: {
      fontSize: 15
    }
});


export default ChangeLanguageScreen