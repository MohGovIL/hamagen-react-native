import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Modal, FlatList, Clipboard, Alert } from 'react-native';
import { connect } from 'react-redux';
import moment from 'moment';
import AsyncStorage from '@react-native-community/async-storage';
import { Text, TouchableOpacity } from '../common';
import { queryDB } from '../../services/Tracker';
import { DBLocation } from '../../types';
import { HIGH_VELOCITY_POINTS_QA, SCREEN_HEIGHT, SCREEN_WIDTH } from '../../constants/Constants';

interface Props {
  isVisible: boolean,
  type: string,
  closeModal(): void
}

const PopupForQA = ({ isVisible, type, closeModal }: Props) => {
  const [listOfSamples, setListOfSamples] = useState<DBLocation[]>([]);

  useEffect(() => {
    isVisible && updateList();
  }, [isVisible]);

  const updateList = async () => {
    const list = type === 'locations' ? await queryDB() : JSON.parse(await AsyncStorage.getItem(HIGH_VELOCITY_POINTS_QA) || '[]');
    setListOfSamples(list);
  };

  const copyClicked = (arr: any) => {
    let csv = 'lat, long, accuracy, startTime, endTime, reason\n';

    arr.forEach((point: any) => {
      const { lat, long, accuracy, startTime, endTime, reason } = point;
      csv += `${lat},${long},${accuracy},${startTime},${endTime},${reason || ''}\n`;
    });

    Alert.alert('הועתק', '', [{ text: 'OK', onPress: () => console.log('OK Pressed') }]);
    Clipboard.setString(csv);
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
              </View>
            )}
            keyExtractor={(_, index) => index.toString()}
            showsHorizontalScrollIndicator={false}
            ItemSeparatorComponent={() => <View style={styles.separatorStyle} />}
          />

          <TouchableOpacity onPress={() => copyClicked(listOfSamples)}>
            <Text style={styles.button}>Copy</Text>
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
