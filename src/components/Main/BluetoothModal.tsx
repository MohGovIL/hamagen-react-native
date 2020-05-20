import React, { FunctionComponent } from 'react';
import { View, StyleSheet } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import BluetoothPermission from '../common/BluetoothPermission';
import { HeaderButton } from '../common';
import { PADDING_TOP, IS_SMALL_SCREEN, PADDING_BOTTOM } from '../../constants/Constants';

const BluetoothModal = ({ navigation }) => {
    return (
        <View style={styles.container}> 
            <HeaderButton type='close' onPress={navigation.goBack}/>
            <BluetoothPermission onEnd={navigation.goBack} />
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: PADDING_TOP(IS_SMALL_SCREEN ? 10 : 92),
        paddingBottom: PADDING_BOTTOM(IS_SMALL_SCREEN ? 10 : 77)
    },
});

export default BluetoothModal