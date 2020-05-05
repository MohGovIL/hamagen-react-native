import React, { useState } from 'react';
import { View, StyleSheet, Button, Alert, ScrollView, Clipboard } from 'react-native';
import { connect } from 'react-redux';
import DocumentPicker from 'react-native-document-picker';
import DeviceInfo from 'react-native-device-info';
import RNFS from 'react-native-fs';
import Share from 'react-native-share';
import { check, PERMISSIONS, request, RESULTS } from 'react-native-permissions';
import { bindActionCreators } from 'redux';
import AsyncStorage from '@react-native-community/async-storage';
import moment from 'moment';
import PopupForQA from './PopupForQA';
import { Icon, TouchableOpacity, Text } from '../common';
import { updatePointsFromFile } from '../../actions/ExposuresActions';
import { checkSickPeople, checkSickPeopleFromFile, queryDB } from '../../services/Tracker';
import { insertToSampleDB, kmlToGeoJson } from '../../services/LocationHistoryService';
import { getUserLocationsReadyForServer } from '../../services/DeepLinkService';
import { UserLocationsDatabase } from '../../database/Database';
import { onError } from '../../services/ErrorService';
import config from '../../config/config';
import { Exposure } from '../../types';
import {
  ALL_POINTS_QA,
  HIGH_VELOCITY_POINTS_QA, IS_IOS,
  PADDING_BOTTOM,
  PADDING_TOP,
  SERVICE_TRACKER
} from '../../constants/Constants';

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
        debugger;
        let isFirst = true;

        for (const item of pointsArr) {
          if (!isFirst) { // to ignore the first row which holds the titles...
            const sampleArr = item.split(',');

            if (sampleArr.length >= 4) {
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

  const shareShareLocationsInfo = async () => {
    try {
      const filename = 'locationsData.json';
      const baseDir = RNFS.CachesDirectoryPath;
      const filepath = `${baseDir}/${filename}`;

      await RNFS.writeFile(filepath, JSON.stringify(await getUserLocationsReadyForServer('XXXX')), 'utf8');
      await Share.open({ title: 'שיתוף מיקומי חולה מאומת', url: IS_IOS ? filepath : `file://${filepath}` });
    } catch (error) {
      onError({ error });
    }
  };

  const initCheckSickPeople = async () => {
    try {
      await checkSickPeople(true);
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

  const clearAllPoints = async () => {
    try {
      await AsyncStorage.removeItem(ALL_POINTS_QA);
      Alert.alert('Cleared', '', [{ text: 'OK' }]);
    } catch (e) {
      Alert.alert('Error', '', [{ text: 'OK' }]);
    }
  };

  const clearLocationsDB = () => {
    const db = new UserLocationsDatabase();
    db.purgeSamplesTable(moment().valueOf());
    Alert.alert('Cleared', '', [{ text: 'OK' }]);
  };

  const copyServicesTrackingData = async () => {
    const res: Array<{ source: string, timestamp: number }> = JSON.parse(await AsyncStorage.getItem(SERVICE_TRACKER) || '[]');

    let csv = 'source, timestamp\n';

    res.forEach(({ source, timestamp }: any) => {
      csv += `${source},${timestamp}\n`;
    });

    Clipboard.setString(csv);
    Alert.alert('Services data copied', '', [{ text: 'OK' }]);
  };

  const clearServicesTrackingData = async () => {
    await AsyncStorage.removeItem(SERVICE_TRACKER);
    Alert.alert('Cleared', '', [{ text: 'OK' }]);
  };

  const copyAllData = async () => {
    const allPoints = JSON.parse(await AsyncStorage.getItem(ALL_POINTS_QA) || '[]');
    const DBPoints = await queryDB();
    const HVPoints = JSON.parse(await AsyncStorage.getItem(HIGH_VELOCITY_POINTS_QA) || '[]');
    const services = JSON.parse(await AsyncStorage.getItem(SERVICE_TRACKER) || '[]');

    let csv = 'All Points\n';

    allPoints.forEach((point: any) => {
      const { lat, long, accuracy, startTime, endTime, reason, eventTime } = point;
      csv += `${lat},${long},${accuracy},${startTime},${endTime},${reason || ''},${eventTime || ''}\n`;
    });

    csv += 'DB Points\n';

    DBPoints.forEach((point: any) => {
      const { lat, long, accuracy, startTime, endTime, reason, eventTime } = point;
      csv += `${lat},${long},${accuracy},${startTime},${endTime},${reason || ''},${eventTime || ''}\n`;
    });

    csv += 'HV Points\n';

    HVPoints.forEach((point: any) => {
      const { lat, long, accuracy, startTime, endTime, reason, eventTime } = point;
      csv += `${lat},${long},${accuracy},${startTime},${endTime},${reason || ''},${eventTime || ''}\n`;
    });

    csv += 'Services\n';

    services.forEach((point: any) => {
      const { source, timestamp } = point;
      csv += `${source},${timestamp}\n`;
    });

    Alert.alert('הועתק', '', [{ text: 'OK', onPress: () => console.log('OK Pressed') }]);
    Clipboard.setString(csv);
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

        <View style={styles.buttonWrapper}>
          <Button title="הצג 'דקירות' מה-SDK" onPress={() => setShowPopup({ showPopup: true, type: 'SDK' })} />
        </View>

        <View style={styles.buttonWrapper}>
          <Button title="הצג את כל ה'דקירות'" onPress={() => setShowPopup({ showPopup: true, type: 'all' })} />
        </View>

        <View style={styles.buttonWrapper}>
          <Button title="נקה את כל ה'דקירות'" onPress={clearAllPoints} />
        </View>

        <View style={styles.buttonWrapper}>
          <Button title="שתף מידע לשיתוף מיקומים" onPress={shareShareLocationsInfo} />
        </View>

        <View style={styles.buttonWrapper}>
          <Button title="העתק מידע מעקב שירותים" onPress={copyServicesTrackingData} />
        </View>

        <View style={styles.buttonWrapper}>
          <Button title="נקה מידע מעקב שירותים" onPress={clearServicesTrackingData} />
        </View>

        <View style={styles.buttonWrapper}>
          <Button title="העתק את כל הנתונים" onPress={copyAllData} />
        </View>

        <View style={styles.buttonWrapper}>
          <Button title="!!!!!נקה את כל ה'דקירות' מה-DB!!!!!" onPress={clearLocationsDB} color="red" />
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
