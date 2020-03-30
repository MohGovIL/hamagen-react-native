import React from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { connect } from 'react-redux';
import moment from 'moment';
import { Icon, TouchableOpacity, Text } from '../../common';
import { Exposure } from '../../../types';
import { PADDING_TOP, SCREEN_HEIGHT, SCREEN_WIDTH } from '../../../constants/Constants';

interface Props {
  navigation: any,
  isRTL: boolean,
  strings: any,
  pastExposures: Exposure[]
}

const ExposuresHistory = (
  {
    navigation,
    strings: {
      scanHome: { inDate, fromHour },
      exposuresHistory: { title, noExposures }
    },
    isRTL,
    pastExposures
  }: Props
) => {
  const renderEmptyState = () => (
    <View style={styles.headerSubContainer}>
      <Icon source={require('../../../assets/main/exposuresSmall.png')} width={21} height={13} customStyles={{ marginBottom: 10 }} />
      <Text style={{ fontSize: 20 }}>{noExposures}</Text>
    </View>
  );

  const renderList = () => (
    <FlatList
      data={pastExposures}
      renderItem={({ item }) => {
        const { properties: { Place, fromTime } } = item;

        return (
          <View style={styles.listItemContainer}>
            <View style={[styles.listItemSubContainer, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
              <Icon source={require('../../../assets/main/exposuresSmall.png')} width={21} height={13} customStyles={{ marginHorizontal: 7.5 }} />
              <View style={{ alignItems: isRTL ? 'flex-end' : 'flex-start', marginHorizontal: 7.5 }}>
                <Text style={styles.text}>{Place}</Text>
                <Text>
                  <Text style={styles.text}>{`${inDate} `}</Text>
                  <Text style={styles.text} bold>{`${moment(fromTime).format('DD.MM.YY')} `}</Text>
                  <Text style={styles.text}>{`${fromHour} `}</Text>
                  <Text style={styles.text} bold>{`${moment(fromTime).format('HH:mm')}`}</Text>
                </Text>
              </View>
            </View>
            <View style={styles.separator} />
          </View>
        );
      }}
      keyExtractor={(_, index) => index.toString()}
      showsVerticalScrollIndicator={false}
    />
  );

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={navigation.goBack}>
        <Icon source={require('../../../assets/onboarding/close.png')} width={31} customStyles={{ marginLeft: 20 }} />
      </TouchableOpacity>

      <View style={styles.headerContainer}>
        <View style={styles.headerSubContainer}>
          <Icon source={require('../../../assets/main/history.png')} width={27} height={20} customStyles={{ marginBottom: 15 }} />
          <Text bold>{title}</Text>
        </View>

        <View style={styles.separator} />
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
    alignItems: 'center'
  },
  headerSubContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  separator: {
    width: SCREEN_WIDTH * 0.875,
    height: 2,
    borderRadius: 1,
    backgroundColor: '#eaeaea'
  },
  listItemContainer: {
    width: SCREEN_WIDTH,
    alignItems: 'center'
  },
  listItemSubContainer: {
    width: SCREEN_WIDTH * 0.875,
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 15
  },
  text: {
    fontSize: 14,
    lineHeight: 20
  }
});

const mapStateToProps = (state: any) => {
  const {
    locale: { isRTL, strings },
    exposures: { pastExposures }
  } = state;

  return { isRTL, strings, pastExposures };
};

export default connect(mapStateToProps, null)(ExposuresHistory);
