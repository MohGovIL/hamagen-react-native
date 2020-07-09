import React, { useEffect, useState, useMemo } from 'react';
import { View, TextInput, Platform, StyleSheet, ToastAndroid, Button } from 'react-native';
// @ts-ignore
import AsyncStorage from '@react-native-community/async-storage';
import { Text } from '../common';
import { SCREEN_WIDTH, MAIN_COLOR, PADDING_TOP, BLE_CONFIG, BLE_DEFAULT_CONFIG_STRING, } from '../../constants/Constants';
import { onError } from '../../services/ErrorService';
import { initBLETracing } from '../../services/BLEService';
import log from '../../services/LogService';

const BLE_DEFAULT_CONFIG = JSON.parse(BLE_DEFAULT_CONFIG_STRING);

const BLEConf = () => {
  const [config, setConfig] = useState(BLE_DEFAULT_CONFIG);
  const canCommit = useMemo(() => {
    for (const key in config) {
      if (typeof config[key] !== 'number') return false;
    }
    return true;
  }, [config]);

  useEffect(() => {
    AsyncStorage.getItem(BLE_CONFIG).then((res) => {
      if (res) {
        setConfig(JSON.parse(res));
      }
    }).catch((error) => {
      onError({ error });
    });
  }, []);

  const commitConfig = async () => {
    try {
      await AsyncStorage.setItem(BLE_CONFIG, JSON.stringify(config));
      await initBLETracing();
            
      ToastAndroid.showWithGravity(
        'שירות BLE קונפג מחדש',
        ToastAndroid.SHORT,
        ToastAndroid.BOTTOM
      );
      log(`Change BLE config\n${JSON.stringify(config, null, 2)}`);
    } catch (error) {
      onError({ error });
      ToastAndroid.showWithGravity(
        'חלה שגיאה',
        ToastAndroid.SHORT,
        ToastAndroid.BOTTOM
      );
    }
  };

  return (
    <>
      <View style={{ width: SCREEN_WIDTH, height: 2, backgroundColor: MAIN_COLOR, marginBottom: 10 }} />
      <Text style={[styles.buttonWrapper, { fontSize: 22 }]} bold>ערוך</Text>

      <View style={[styles.buttonWrapper, { flexDirection: 'row', alignItems: 'center', }]}>
        <TextInput
          style={{ borderWidth: 1, flexGrow: 1, paddingHorizontal: 10 }}
          keyboardType="numeric"
          value={config.scanDuration.toString()}
          onChangeText={(text) => {
            setConfig(state => ({ ...state, scanDuration: text ? parseInt(text) : '' }));
          }}
        />
        <Text style={{ flex: 1, textAlign: 'right' }}>(ms) משך סריקה</Text>
      </View>

      <View style={[styles.buttonWrapper, { flexDirection: 'row', alignItems: 'center', }]}>
        <TextInput
          style={{ borderWidth: 1, flexGrow: 1, paddingHorizontal: 10 }}
          keyboardType="numeric"
          value={config.scanInterval.toString()}
          onChangeText={(text) => {
            setConfig(state => ({ ...state, scanInterval: text ? parseInt(text) : '' }));
          }}
        />
        <Text style={{ flex: 1, textAlign: 'right' }}>(ms) מרווח סריקה</Text>
      </View>

      <View style={[styles.buttonWrapper, { flexDirection: 'row', alignItems: 'center', }]}>
        <TextInput
          style={{ borderWidth: 1, flexGrow: 1, paddingHorizontal: 10 }}
          keyboardType="numeric"
          value={config.advertiseDuration.toString()}
          onChangeText={(text) => {
            setConfig(state => ({ ...state, advertiseDuration: text ? parseInt(text) : '' }));
          }}
        />
        <Text style={{ flex: 1, textAlign: 'right' }}>(ms) משך סריקה</Text>
      </View>

      <View style={[styles.buttonWrapper, { flexDirection: 'row', alignItems: 'center', }]}>
        <TextInput
          style={{ borderWidth: 1, flexGrow: 1, paddingHorizontal: 10 }}
          keyboardType="numeric"
          value={config.advertiseInterval.toString()}
          onChangeText={(text) => {
            setConfig(state => ({ ...state, advertiseInterval: text ? parseInt(text) : '' }));
          }}
        />
        <Text style={{ flex: 1, textAlign: 'right' }}>(ms) מרווח שידור</Text>
      </View>
      <View style={styles.buttonWrapper}>
        <Button disabled={!canCommit} title="שינוי הגדרות" onPress={commitConfig} />
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: PADDING_TOP(50),
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: '#fff'
  },
  close: {
    position: 'absolute',
    top: PADDING_TOP(20),
    left: 20,
    zIndex: 1000
  },
  buttonsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  buttonWrapper: {
    marginBottom: 10
  }
});

export default BLEConf;
