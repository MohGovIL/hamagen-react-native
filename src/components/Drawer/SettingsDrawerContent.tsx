import React, { useState, useCallback } from 'react';
import { ImageBackground, StyleSheet, TouchableOpacity, View } from 'react-native';
import { DrawerNavigationProp } from '@react-navigation/drawer';
import { useDispatch, useSelector } from 'react-redux';
import AsyncStorage from '@react-native-community/async-storage';
import BackgroundGeolocation, { DeviceSettingsRequest } from 'react-native-background-geolocation';
import { useFocusEffect } from '@react-navigation/native';
import DrawerItem from './DrawerItem';
import { Icon, Text } from '../common';
import { Store } from '../../types';
import {
    HIT_SLOP, PADDING_BOTTOM,
    PADDING_TOP,
    SCREEN_HEIGHT,
    SCREEN_WIDTH,
    USAGE_PRIVACY,
    VERSION_NAME,
    USER_AGREED_TO_BATTERY,
    IS_IOS,
    IS_SMALL_SCREEN,
} from '../../constants/Constants';
import { toggleWebview } from '../../actions/GeneralActions';
import { USER_DISABLED_BATTERY } from '../../constants/ActionTypes';

interface Props {
    navigation: DrawerNavigationProp<any, 'DrawerStack'>
}

const SettingsDrawerContent = ({ navigation, goToMainDrawer }: Props) => {
    const dispatch = useDispatch();

    const { locale: { strings: { general: { versionNumber, additionalInfo }, exposuresHistory, languages, menu: { battery, bluetooth, settings } }, isRTL }, general: { enableBle, batteryDisabled } } = useSelector<Store, Store>(state => state);

    return (
        <View style={styles.container}>
            <TouchableOpacity
                style={[styles.close, { [!isRTL ? 'left' : 'right']: 20, flexDirection: isRTL ? 'row-reverse' : 'row' }]}
                hitSlop={HIT_SLOP}
                onPress={goToMainDrawer}
            >
                <Icon
                    height={13}
                    source={require('../../assets/main/menuBack.png')}
                    customStyles={{
                        borderLeftWidth: StyleSheet.hairlineWidth,
                        borderColor: 'rgb(32, 49, 94)',
                        [!isRTL ? 'paddingRight' : 'paddingLeft']: 25,
                        transform: [{ rotateY: isRTL ? '0deg' : '180deg' }]
                    }}
                />
                <Text style={[{ color: 'rgb(32, 49, 94)', [isRTL ? 'marginRight' : 'marginLeft']: 7, }]} bold>{settings.label}</Text>
            </TouchableOpacity>
            

            {!IS_IOS && (
                <DrawerItem
                    isRTL={isRTL}
                    icon={require('../../assets/main/batteryMenu.png')}
                    iconSize={24}
                    onPress={() => {
                        navigation.navigate('BatterySettings');
                    }}
                    style={{ alignItems: 'flex-start' }}
                    label={(
                        <View style={{ paddingHorizontal: 19, alignItems: 'stretch' }}>
                            <Text style={{ fontSize: 18, textAlign: isRTL ? 'right' : 'left' }}>{battery.label}</Text>
                            <View style={{
                                flexDirection: isRTL ? 'row-reverse' : 'row',
                                marginTop: IS_SMALL_SCREEN ? 5 : 8,
                                [isRTL ? 'marginRight' : 'marginRight']: IS_SMALL_SCREEN ? 65 : 85
                            }}
                            >
                                <View style={{
                                    backgroundColor: batteryDisabled ? 'rgb(195,219,110)' : 'rgb(255,130,130)',
                                    width: 10,
                                    height: 10,
                                    borderRadius: 10,
                                    marginTop: 5
                                }}
                                />
                                <Text style={{ fontSize: 14, textAlign: isRTL ? 'right' : 'left', marginHorizontal: 8 }}>{battery[batteryDisabled ? 'batteryOptimized' : 'batteryNotOptimized']}</Text>
                            </View>
                        </View>
                    )
                    }
                />
            )}
            <DrawerItem
                isRTL={isRTL}
                icon={require('../../assets/main/bluetoothMenu.png')}
                iconSize={24}
                style={{ alignItems: 'flex-start' }}
                label={(
                    <View style={{ paddingHorizontal: 19, alignItems: 'stretch' }}>
                        <Text style={{ fontSize: 18, textAlign: isRTL ? 'right' : 'left' }}>{bluetooth.label}</Text>
                        <View style={{
                            flexDirection: isRTL ? 'row-reverse' : 'row',
                            marginTop: IS_SMALL_SCREEN ? 5 : 8,
                            [isRTL ? 'marginRight' : 'marginRight']: IS_SMALL_SCREEN ? 65 : 85
                        }}
                        >
                            <View style={{
                                backgroundColor: enableBle ? 'rgb(195,219,110)' : 'rgb(255,130,130)',
                                width: 10,
                                height: 10,
                                borderRadius: 10,
                                marginTop: 5
                            }}
                            />
                            <Text style={{ fontSize: 14, textAlign: isRTL ? 'right' : 'left', marginHorizontal: 8 }}>{bluetooth[enableBle ? 'BLEOn' : 'BLEOff']}</Text>
                        </View>
                    </View>
                )}
                onPress={() => {
                    
                    navigation.navigate('BluetoothSettings')
                }}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        width: SCREEN_WIDTH,
        height: SCREEN_HEIGHT,
        paddingTop: PADDING_TOP(SCREEN_HEIGHT * 0.15),
    },
    close: {
        position: 'absolute',
        top: PADDING_TOP(20),
        zIndex: 1000,
        alignItems: 'center'
    },
    buttonsContainer: {
        flex: 1,
        paddingTop: PADDING_TOP(SCREEN_HEIGHT * 0.15)
    },
    footerContainer: {
        paddingTop: 20,
        paddingBottom: PADDING_BOTTOM(20)
    },
    versionText: {
        fontSize: 12,
        paddingHorizontal: 25
    },
    item: {
        justifyContent: 'space-between',
        alignItems: 'center',

        paddingHorizontal: 25,
        paddingVertical: 24,

        borderBottomColor: 'white',
        borderBottomWidth: 1.5,
    },
    label: {
        fontSize: 18,
        paddingHorizontal: 19
    }
});

export default SettingsDrawerContent;



