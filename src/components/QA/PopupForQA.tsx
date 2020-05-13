import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Modal, FlatList, Clipboard, Alert } from 'react-native';
import { connect } from 'react-redux';
import RNFS from 'react-native-fs';
import { request, PERMISSIONS, RESULTS, } from 'react-native-permissions';
import moment from 'moment';
import BackgroundGeolocation from 'react-native-background-geolocation';
import AsyncStorage from '@react-native-community/async-storage';
import { Text, TouchableOpacity } from '../common';
import { queryDB } from '../../services/Tracker';
import { getUserLocationsReadyForServer } from '../../services/DeepLinkService';
import { Cluster, DBLocation } from '../../types';
import { ALL_POINTS_QA, HIGH_VELOCITY_POINTS_QA, IS_IOS, SCREEN_HEIGHT, SCREEN_WIDTH } from '../../constants/Constants';

interface Props {
  isVisible: boolean,
  type: string,
  closeModal(): void
}

const PopupForQA = ({ isVisible, type, closeModal }: Props) => {
  const [listOfSamples, setListOfSamples] = useState<DBLocation[]|Cluster[]>([]);

  useEffect(() => {
    isVisible && updateList();
  }, [isVisible]);

  const updateList = async () => {
    let list;

    switch (type) {
      case 'locations': {
        list = await queryDB(false);
        break;
      }

      case 'clusters': {
        list = await queryDB(true);
        break;
      }

      case 'all': {
        list = JSON.parse(await AsyncStorage.getItem(ALL_POINTS_QA) || '[]');
        break;
      }

      case 'velocity': {
        list = JSON.parse(await AsyncStorage.getItem(HIGH_VELOCITY_POINTS_QA) || '[]');
        break;
      }

      case 'SDK': {
        list = await BackgroundGeolocation.getLocations();
        list = list.map((location: any) => ({
          lat: location.coords.latitude,
          long: location.coords.longitude,
          accuracy: location.coords.accuracy,
          startTime: location.timestamp,
          endTime: location.timestamp,
          reason: 'SDK'
        }));
        break;
      }

      default: {
        list = [];
      }
    }

    setListOfSamples(list);
  };

  const copyClicked = async (arr: any) => {
    let csv = type !== 'clusters' ? 'lat, long, accuracy, startTime, endTime, reason\n' : 'lat, long, startTime, endTime, radius, size\n';

    arr.forEach((point: any) => {
      const { lat, long, accuracy, startTime, endTime, reason, eventTime, radius, size } = point;
      csv += type !== 'clusters' ? `${lat},${long},${accuracy},${startTime},${endTime},${reason || ''},${eventTime || ''}\n` : `${lat},${long},${startTime},${endTime},${radius},${size}\n`;
    });

    Alert.alert('הועתק', '', [{ text: 'OK', onPress: () => console.log('OK Pressed') }]);
    Clipboard.setString(csv);

    if (!IS_IOS && type === 'locations') {
      const permissionResult = await request(PERMISSIONS.ANDROID.WRITE_EXTERNAL_STORAGE);

      if (permissionResult === RESULTS.GRANTED) {
        const filename = 'points.csv';
        const baseDir = RNFS.DownloadDirectoryPath;
        const filepath = `${baseDir}/${filename}`;

        await RNFS.writeFile(filepath, csv, 'utf8');
      }
    }
  };

  return (
    <Modal
      visible={isVisible}
      animationType="slide"
      transparent
      onRequestClose={closeModal}
    >
      <View style={styles.mainContainer}>
        <View style={styles.container}>

          <TouchableOpacity onPress={closeModal} style={{ alignSelf: 'flex-start', marginHorizontal: 10 }}>
            <View style={styles.exit}>
              <Text>X</Text>
            </View>
          </TouchableOpacity>

          <FlatList
            data={listOfSamples}
            renderItem={({ item }) => (
              <View style={{ alignItems: 'center' }}>
                <Text>{`lat: ${item.lat}, long: ${item.long} `}</Text>
                <Text>{`start time: ${moment(item.startTime).format('MM/DD/YYYY - HH:mm:ss')}`}</Text>
                <Text>{`end time: ${moment(item.endTime).format('MM/DD/YYYY - HH:mm:ss')}`}</Text>
                <Text>
                  {item.radius !== undefined && <Text>{`radius: ${item.radius.toFixed(2)} `}</Text>}
                  {item.size !== undefined && <Text>{`size: ${item.size}`}</Text>}
                </Text>
              </View>
            )}
            keyExtractor={(_, index) => index.toString()}
            showsHorizontalScrollIndicator={false}
            ItemSeparatorComponent={() => <View style={styles.separatorStyle} />}
          />

          <Text>{`ס"כ נקודות: ${listOfSamples.length}`}</Text>
          <TouchableOpacity onPress={() => copyClicked(listOfSamples)}>
            <View style={styles.button}>
              <Text>Copy</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    height: SCREEN_HEIGHT,
    width: SCREEN_WIDTH,
    backgroundColor: '#E3CCFF',
    alignItems: 'center',
    justifyContent: 'center'
  },
  container: {
    height: SCREEN_HEIGHT - 100,
    width: SCREEN_WIDTH - 30,
    backgroundColor: '#fff',
    borderRadius: 20,
    alignItems: 'center'
  },
  button: {
    backgroundColor: '#E3CCFF',
    height: 30,
    width: 100,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 5
  },
  exit: {
    backgroundColor: '#E3CCFF',
    height: 30,
    width: 30,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20
  },
  separatorStyle: {
    width: SCREEN_WIDTH - 30,
    height: 3,
    backgroundColor: '#000'
  },
});

export default connect(null, null)(PopupForQA);
