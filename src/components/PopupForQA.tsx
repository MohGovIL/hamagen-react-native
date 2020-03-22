import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Modal, FlatList, Clipboard, Alert } from 'react-native';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import moment from 'moment';
import { Text, TouchableOpacity } from './common';
import { deleteAllLocations } from '../actions/MyLocationActions';
import { SCREEN_HEIGHT, SCREEN_WIDTH } from '../constants/Constants';
import { queryDB } from '../services/Tracker';

interface Props {
  isVisible: boolean,
  latelyEnteredPoints: any,
  closeModal(): void,
  deleteAllLocations(): void
}

const PopupForQA = ({ isVisible, closeModal, deleteAllLocations, latelyEnteredPoints }: Props) => {
  const [listOfSamples, setListOfSamples] = useState([]);

  useEffect(() => {
    isVisible && updateList();
  }, [isVisible]);

  const updateList = async () => {
    const list = await queryDB();
    setListOfSamples(list);
  };

  const copyClicked = (arr: any) => {
    let csv = 'lat, long, accuracy, startTime, endTime\n';
    arr.forEach((point: any) => {
      const { lat, long, accuracy, startTime, endTime } = point;
      csv += `${lat},${long},${accuracy},${startTime},${endTime}\n`;
    });

    Alert.alert('הועתק', '', [{ text: 'OK', onPress: () => console.log('OK Pressed') }]);
    Clipboard.setString(csv);
  };

  return (
    <Modal
      visible={isVisible}
      animationType="fade"
      transparent
      onRequestClose={() => {}}
    >
      <View style={styles.mainContainer}>
        <View style={styles.container}>

          <TouchableOpacity onPress={() => closeModal()} style={{ alignSelf: 'flex-start', marginHorizontal: 10 }}>
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


          {/* <TouchableOpacity onPress={() => deleteAllLocations()}> */}
          {/*  <View style={styles.button}> */}
          {/*    <Text>מחק הכל</Text> */}
          {/*  </View> */}
          {/* </TouchableOpacity> */}

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

const mapStateToProps = (state: any) => {
  const {
    MyLocation: { latelyEnteredPoints }
  } = state;

  return { latelyEnteredPoints };
};

const mapDispatchToProps = (dispatch: any) => {
  return bindActionCreators({
    deleteAllLocations
  }, dispatch);
};

export default connect(mapStateToProps, mapDispatchToProps)(PopupForQA);
