import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, TouchableOpacity, ImageBackground } from 'react-native';
import { createDrawerNavigator, } from '@react-navigation/drawer';
import DrawerItem from './DrawerItem'
import ScanHome from '../Main/ScanHome';
import ExposuresHistory from '../Main/ExposuresHistory/ExposuresHistory';

import { Text, Icon } from '../common';
import ChangeLanguage from '../ChangeLanguage/ChangeLanguageScreen'
import { HIT_SLOP,VERSION_NAME } from '../../constants/Constants';

const Drawer = createDrawerNavigator()

const CustomDrawerContent = (props) => {
    
      return (
        <ImageBackground 
            source={require('../../assets/main/menuBG.png')}
            style={{flex: 1,}}>
                <View style={{ flex: 1}}>
                    <View style={{flex: 2,justifyContent: 'center', alignItems: 'flex-start',}}>
                        <TouchableOpacity 
                            hitSlop={HIT_SLOP}
                            onPress={props.navigation.closeDrawer}
                            style={{marginHorizontal:25 , marginTop: 35 }}>
                            <Icon source={require('../../assets/main/menuClose.png')} width={12} height={18} />
                        </TouchableOpacity>
                    </View>
                </View>
                <View style={{flex: 10, paddingTop: 60}}>
                    <DrawerItem 
                        {...props}
                        name="ExposuresHistory"
                        icon={() => <Icon source={require('../../assets/main/history.png')} width={18}/>} 
                        label="היסטוריית נקודות חפיפה" 
                        />
                    <DrawerItem 
                        {...props}
                        name="ChangeLanguage"
                        label="בחירת שפה" 
                        icon={() => <Icon source={require('../../assets/main/lang.png')} width={18}/>} 
                    />
                    <DrawerItem 
                        {...props}
                        name="ExposuresHistory"
                        label="מדיניות פרטיות ומידף נוסף" 
                        icon={() => <Icon source={require('../../assets/main/policy.png')} width={18}/>} 
                        />
                </View>
                <View style={{flex: 1, alignItems: 'flex-end', paddingHorizontal: 14}}>
                    <Text style={{fontSize: 12}}>{`מספר גרסה: ${VERSION_NAME}`}</Text>
                </View>
                
        </ImageBackground>
      );
}

const Home = (rest) => {
  
  return (
    <Drawer.Navigator 
        screenOptions={{gestureEnabled: false}}
        drawerContent={(props) => <CustomDrawerContent {...props} isRTL={rest.route.params?.isRTL}/>}
        drawerPosition="right"
        drawerStyle={{
            width: '100%'
        }}
        >
        <Drawer.Screen name="ScanHome" component={ScanHome}  />
        <Drawer.Screen name="ExposuresHistory" component={ExposuresHistory} />
        
        <Drawer.Screen name="ChangeLanguage" component={ChangeLanguage}  />
  </Drawer.Navigator>
)}

export default Home