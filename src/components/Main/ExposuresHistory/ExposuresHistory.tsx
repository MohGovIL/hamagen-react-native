import React from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { connect } from 'react-redux';
import { Icon, Text, HeaderButton } from '../../common';
import { Strings } from '../../../locale/LocaleData';
import { Exposure } from '../../../types';
import { PADDING_TOP, SCREEN_HEIGHT, SCREEN_WIDTH } from '../../../constants/Constants';
import ExposureHistoryListItem from './ExposureHistoryListItem';
import { showMapModal } from '../../../actions/GeneralActions';

interface Props {
  navigation: StackNavigationProp<any>,
  isRTL: boolean,
  strings: Strings,
  pastExposures: Exposure[],
  showMapModal(exposures: Exposure): void
}

const ExposuresHistory = (
  {
    navigation,
    strings,
    isRTL,
    pastExposures,
    showMapModal
  }: Props
) => {
  const { exposuresHistory: { title, noExposures, keepInstructions } } = strings;

  const renderEmptyState = () => (
    <>
      <View style={styles.emptyStateContainer}>
        <Icon source={require('../../../assets/main/exposuresSmall.png')} width={32} height={20} customStyles={{ marginBottom: 10 }} />
        <Text style={{ marginBottom: 30 }}>{noExposures}</Text>
        <Text bold>{keepInstructions}</Text>
      </View>

      <View style={{ flex: 1 }} />
    </>
  );

  const renderList = () => (
    <FlatList
      contentContainerStyle={styles.listContainer}
      data={pastExposures}
      renderItem={({ item }) => <ExposureHistoryListItem isRTL={isRTL} strings={strings} Place={item.properties.Place} fromTime={item.properties.fromTime} showExposureOnMap={() => showMapModal(item)} />}
      keyExtractor={(_, index) => index.toString()}
      ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
      showsVerticalScrollIndicator={false}
    />
  );

  return (
    <View style={styles.container}>
      <HeaderButton type="back" onPress={navigation.goBack} />

      <View style={styles.headerContainer}>
        <Icon source={require('../../../assets/main/history.png')} width={27} height={20} customStyles={{ marginBottom: 15 }} />
        <Text bold>{title}</Text>
      </View>

      {pastExposures.length === 0 ? renderEmptyState() : renderList()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: PADDING_TOP(15),
    backgroundColor: '#fff'
  },
  headerContainer: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT * 0.16,
    justifyContent: 'center',
    alignItems: 'center'
  },
  listContainer: {
    width: SCREEN_WIDTH,
    alignItems: 'center',
    paddingVertical: 10,
    
  },
  emptyStateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 35
  }
});

const mapStateToProps = (state: any) => {
  const {
    locale: { isRTL, strings },
    exposures: { pastExposures }
  } = state;

  return { isRTL, strings, pastExposures: [{
    geometry: {
      type: 'Point',
      coordinates: [34.8077312410001, 32.1154996280001],
    },
    properties: {
      OBJECTID: 1720,
      Key_Field: 1720,
      Name: 'חולה 15',
      Place: 'קלאוזנר 14, רמת אביב (קלפי ייעודית למבודדי בית)',
      Comments:
        'על מי ששעת הגעתו לקלפי זו היתה בין השעות 10:15-11:15 להאריך את הבידוד הביתי ל14 יום מיום הבחירות',
      POINT_X: 34.80773124,
      POINT_Y: 32.11549963,
      fromTime: 1583144100000,
      toTime: 1583147700000,
      fromTime_utc: 1583144100000,
      toTime_utc: 1583147700000,
      sourceOID: 1,
      stayTimes: '10:15-11:15',
    },
  },{
    geometry: {
      type: 'Point',
      coordinates: [34.8077312410001, 32.1154996280001],
    },
    properties: {
      OBJECTID: 1720,
      Key_Field: 1720,
      Name: 'חולה 15',
      Place: 'קלאוזנר 14, רמת אביב (קלפי ייעודית למבודדי בית)',
      Comments:
        'על מי ששעת הגעתו לקלפי זו היתה בין השעות 10:15-11:15 להאריך את הבידוד הביתי ל14 יום מיום הבחירות',
      POINT_X: 34.80773124,
      POINT_Y: 32.11549963,
      fromTime: 1583144100000,
      toTime: 1583147700000,
      fromTime_utc: 1583144100000,
      toTime_utc: 1583147700000,
      sourceOID: 1,
      stayTimes: '10:15-11:15',
    },
  }] };
};

export default connect(mapStateToProps, { showMapModal })(ExposuresHistory);
