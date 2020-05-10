import React from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { connect } from 'react-redux';
import { Icon, Text, HeaderButton } from '../../common';
import { Strings } from '../../../locale/LocaleData';
import { Exposure } from '../../../types';
import { PADDING_TOP, SCREEN_HEIGHT, SCREEN_WIDTH, IS_SMALL_SCREEN } from '../../../constants/Constants';
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
    paddingHorizontal: IS_SMALL_SCREEN ? 20 : 35
  }
});

const mapStateToProps = (state: any) => {
  const {
    locale: { isRTL, strings },
    exposures: { pastExposures }
  } = state;

  return { isRTL, strings, pastExposures };
};

export default connect(mapStateToProps, { showMapModal })(ExposuresHistory);
