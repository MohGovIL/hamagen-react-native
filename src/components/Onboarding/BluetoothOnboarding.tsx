import React, { FunctionComponent } from 'react';
import { View, StyleSheet } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { StackNavigationProp } from '@react-navigation/stack';
import { ActionButton, GeneralContainer, OnboardingHeader, Text, Icon, TouchableOpacity } from '../common';
import { Strings } from '../../locale/LocaleData';
import { IS_SMALL_SCREEN, MAIN_COLOR, USAGE_PRIVACY } from '../../constants/Constants';
import { Store, LocaleReducer } from '../../types';
import { toggleWebview } from '../../actions/GeneralActions';
import BluetoothPermission from '../common/BluetoothPermission';

interface Props {
    navigation: StackNavigationProp<any>,
}

const BluetoothOnboarding: FunctionComponent<Props> = ({ navigation }) => {
    

    return (
        <GeneralContainer style={styles.container}>
            <OnboardingHeader />
            <BluetoothPermission onEnd={() => navigation.navigate("LocationHistoryOnBoarding")}/>
        </GeneralContainer>
    )
}


const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'space-between',
        alignItems: 'center'
    },
});

export default BluetoothOnboarding

