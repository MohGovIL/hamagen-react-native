import React, { useState } from 'react';
import { View, StyleSheet, Button, Alert, ScrollView, Clipboard } from 'react-native';
import { connect } from 'react-redux';
import DocumentPicker from 'react-native-document-picker';
import DeviceInfo from 'react-native-device-info';
import RNFS from 'react-native-fs';
import { check, PERMISSIONS, request, RESULTS } from 'react-native-permissions';
import { bindActionCreators } from 'redux';
import AsyncStorage from '@react-native-community/async-storage';
import PopupForQA from './PopupForQA';
import { Icon, TouchableOpacity, Text } from '../common';
import { updatePointsFromFile } from '../../actions/ExposuresActions';
import { checkSickPeople, checkSickPeopleFromFile } from '../../services/Tracker';
import { insertToSampleDB, kmlToGeoJson } from '../../services/LocationHistoryService';
import { UserLocationsDatabase } from '../../database/Database';
import config from '../../config/config';
import { Exposure } from '../../types';
import {HIGH_VELOCITY_POINTS_QA, PADDING_BOTTOM, PADDING_TOP} from '../../constants/Constants';

interface Props {
  navigation: any,
  updatePointsFromFile(points: Exposure[]): void
}

const SICK_FILE_TYPE = 1;
const LOCATIONS_FILE_TYPE = 2;
const KML_FILE_TYPE = 3;

const QA = ({ navigation, updatePointsFromFile }: Props) => {
  const [{ showPopup, type }, setShowPopup] = useState<{ showPopup: boolean, type: string }>({ showPopup: false, type: '' });

  const fetchPointsFromFile = async (fileType: number) => {
    try {
      const isStoragePermissionGranted = await check(PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE);
      if (isStoragePermissionGranted === RESULTS.GRANTED) {
        await chooseFile(fileType);
      } else {
        const requestPermissionRes = await request(PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE);
        if (requestPermissionRes === RESULTS.GRANTED) {
          await chooseFile(fileType);
        }
      }
    } catch (err) {
      console.log(err);
    }
  };

  const chooseFile = async (fileType: number) => {
    try {
      const res = await DocumentPicker.pick({
        type: [DocumentPicker.types.allFiles]
      });

      const fileUri = res.uri;
      const rawText = await RNFS.readFile(fileUri);

      if (fileType === SICK_FILE_TYPE) {
        const pointsJSON = JSON.parse(rawText.trim());
        updatePointsFromFile(pointsJSON);
        await checkSickPeopleFromFile();
      } else if (fileType === KML_FILE_TYPE) {
        try {
          const pointsEntered = await insertToSampleDB(kmlToGeoJson(rawText));
          return Alert.alert(`KML loaded - ${pointsEntered} points`);
        } catch (e) {
          return Alert.alert('KML loading failed');
        }
      } else {
        const db = new UserLocationsDatabase();

        // location file
        const pointsArr: string[] = rawText.split('\n');

        let isFirst = true;

        for (const item of pointsArr) {
          if (!isFirst) { // to ignore the first row which holds the titles...
            const sampleArr = item.split(',');

            for (let i = 0; i < sampleArr.length; i++) {
              await db.addSample({
                lat: parseFloat(sampleArr[0]),
                long: parseFloat(sampleArr[1]),
                accuracy: parseFloat(sampleArr[2]),
                startTime: parseFloat(sampleArr[3]),
                endTime: parseFloat(sampleArr[4]),
                geoHash: '',
                wifiHash: ''
              });
            }
          }

          isFirst = false;
        }
      }
    } catch (error) {
      if (DocumentPicker.isCancel(error)) {
        // User cancelled the picker, exit any dialogs or menus and move on
      } else {
        throw error;
      }
    }
  };

  const copyConfig = () => {
    Alert.alert('Config was copied', '', [{ text: 'OK' }]);
    Clipboard.setString(JSON.stringify(config()));
  };

  const initCheckSickPeople = async () => {
    try {
      await checkSickPeople();
      Alert.alert('Checking...', '', [{ text: 'OK' }]);
    } catch (e) {
      Alert.alert('Error', '', [{ text: 'OK' }]);
    }
  };

  const clearHVP = async () => {
    try {
      await AsyncStorage.removeItem(HIGH_VELOCITY_POINTS_QA);
      Alert.alert('Cleared', '', [{ text: 'OK' }]);
    } catch (e) {
      Alert.alert('Error', '', [{ text: 'OK' }]);
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.close} onPress={navigation.goBack}>
        <Icon source={require('../../assets/onboarding/close.png')} width={31} />
      </TouchableOpacity>

      <Text style={{ marginBottom: 30, fontSize: 25 }} bold>{'תפריט בדיקות נסתר\nלבודק(ת) הנהדר(ת)'}</Text>

      <ScrollView>
        <View style={styles.buttonWrapper}>
          <Button title="הצלבה מול JSON מאומתים מקובץ" onPress={() => fetchPointsFromFile(SICK_FILE_TYPE)} />
        </View>

        <View style={styles.buttonWrapper}>
          <Button title="טעינת 'דקירות' מקובץ" onPress={() => fetchPointsFromFile(LOCATIONS_FILE_TYPE)} />
        </View>

        <View style={styles.buttonWrapper}>
          <Button title="טעינת KML מקובץ" onPress={() => fetchPointsFromFile(KML_FILE_TYPE)} />
        </View>

        <View style={styles.buttonWrapper}>
          <Button title="הצג 'דקירות'" onPress={() => setShowPopup({ showPopup: true, type: 'locations' })} />
        </View>

        <View style={styles.buttonWrapper}>
          <Button title="העתק קובץ קונפיגורציה פעיל" onPress={copyConfig} />
        </View>

        <View style={styles.buttonWrapper}>
          <Button title="הצלבה מול JSON מאומתים משרת" onPress={initCheckSickPeople} />
        </View>

        <View style={styles.buttonWrapper}>
          <Button title="הצג 'דקירות' במהירות גבוהה" onPress={() => setShowPopup({ showPopup: true, type: 'velocity' })} />
        </View>

        <View style={styles.buttonWrapper}>
          <Button title="נקה 'דקירות' במהירות גבוהה" onPress={clearHVP} />
        </View>
      </ScrollView>

      <View style={{ marginBottom: PADDING_BOTTOM(20) }}>
        <Text>{DeviceInfo.getVersion()}</Text>
      </View>
      <PopupForQA isVisible={showPopup} type={type} closeModal={() => setShowPopup({ showPopup: false, type: '' })} />
    </View>
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

const mapDispatchToProps = (dispatch: any) => {
  return bindActionCreators({
    updatePointsFromFile
  }, dispatch);
};

export default connect(null, mapDispatchToProps)(QA);
