import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Modal, FlatList, Clipboard, Alert, ActivityIndicator, SectionList } from 'react-native';
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
import { ALL_POINTS_QA, HIGH_VELOCITY_POINTS_QA, IS_IOS, SCREEN_HEIGHT, SCREEN_WIDTH, HIT_SLOP, MAIN_COLOR } from '../../constants/Constants';
import { fetchInfectionDataByConsent } from '../../services/BLEService';

interface Props {
  isVisible: boolean,
  closeModal(): void
}

const PopupForQA = ({ isVisible, closeModal }: Props) => {
  const [list, setList] = useState([]);

  useEffect(() => {
    if (isVisible) {
      fetchInfectionDataByConsent().then((res) => {
        if (res?.days && res?.days.length > 0) {
          const sectionData = res?.days.map((section, index) => {
            const data = section.filter((ephemeral) => {
              return ephemeral.length > 0;
            });
            
            return ({
              title: `day${index + 1}`,
              data
            });
          });
          setList(sectionData);
        }
      });
    }
  }, [isVisible]);


  return (
    <Modal
      visible={isVisible}
      animationType="slide"
      transparent
      onRequestClose={closeModal}
    >
      <View style={styles.mainContainer}>
        <View style={styles.container}>

          <TouchableOpacity
            hitSlop={HIT_SLOP}
            onPress={closeModal}
            style={{ alignSelf: 'flex-start', marginHorizontal: 10 }}
          >
            <View style={styles.exit}>
              <Text>X</Text>
            </View>
          </TouchableOpacity>

          <SectionList
            sections={list}
            contentContainerStyle={{ flexGrow: 1, paddingBottom: 30 }}
            renderSectionHeader={({ section: { title } }) => (
              <Text style={{ backgroundColor: MAIN_COLOR }}>{title}</Text>
            )}
            renderItem={({ item }) => (
              <View><Text>{item || 'empty'}</Text></View>
            )}
            keyExtractor={(item, index) => item || index.toString()}
            showsHorizontalScrollIndicator={false}
            ItemSeparatorComponent={() => <View style={styles.separatorStyle} />}
            ListEmptyComponent={() => {
              return (
                <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                  <Text style={{ fontSize: 30 }} bold>Empty</Text>
                </View>
              );
            }}
          />

          {/* <Text>{`ס"כ נקודות: ${listOfSamples.length}`}</Text>
          <TouchableOpacity onPress={() => copyClicked(listOfSamples)}>
            <View style={styles.button}>
              <Text>Copy</Text>
            </View>
          </TouchableOpacity> */}
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
