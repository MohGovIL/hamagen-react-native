import React, { useState, useEffect, useMemo } from 'react';
import { View, StyleSheet, FlatList, Animated } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { connect } from 'react-redux';
import { Icon, Text, HeaderButton, TouchableOpacity } from '../../common';
import { Strings } from '../../../locale/LocaleData';
import { Exposure } from '../../../types';
import { PADDING_TOP, SCREEN_HEIGHT, SCREEN_WIDTH, IS_SMALL_SCREEN, MAIN_COLOR, HIT_SLOP } from '../../../constants/Constants';
import ExposureHistoryListItem from './ExposureHistoryListItem';
import { showMapModal } from '../../../actions/GeneralActions';
import { stat } from 'fs';

interface Props {
  navigation: StackNavigationProp<any>,
  isRTL: boolean,
  strings: Strings,
  pastExposures: Exposure[],
  showMapModal(exposures: Exposure): void
}

const LINE_MARGIN = 7
const HORIZONTAL_PADDING = IS_SMALL_SCREEN ? 18 : 38
const ANIMATION_DURATION = 300


const ExposuresHistory = (
  {
    navigation,
    strings,
    isRTL,
    pastExposures,
    showMapModal
  }: Props
) => {
  const { exposuresHistory: { title, subTitle, wasNotThere, wasThere, wasThereNoExposure, wasNotThereNoExposure, keepInstructions,edit } } = strings;

  const [tabIndex, setTabIndex] = useState(1)
  const wasThereList = useMemo(() => pastExposures.filter(({ properties }: Exposure) => properties?.wasThere), [pastExposures])
  const wasNotThereList = useMemo(() => pastExposures.filter(({ properties }: Exposure) => !properties?.wasThere), [pastExposures])
  const showEditBtn = useMemo(() => wasThereList.length + wasNotThereList.length > 0, [wasThereList.length, wasNotThereList.length])
  const [tabsLayout, setTabsLayout] = useState({})
  const [lineAnimLeft] = useState(new Animated.Value(0))
  const [lineAnimWidth] = useState(new Animated.Value(0))
  const [listTranslateAnim] = useState(new Animated.Value(0))

  useEffect(() => {
    // didn't layout yet
    if (tabsLayout?.[tabIndex]) {
      Animated.parallel([
        Animated.timing(lineAnimLeft, {
          toValue: tabsLayout[tabIndex].x - LINE_MARGIN,
          duration: ANIMATION_DURATION,
        }),
        Animated.timing(listTranslateAnim, {
          toValue: tabIndex ? SCREEN_WIDTH : 0,
          duration: ANIMATION_DURATION,
          useNativeDriver: true
        }),
        Animated.timing(lineAnimWidth, {
          toValue: tabsLayout[tabIndex].width + (LINE_MARGIN * 2),
          duration: ANIMATION_DURATION,
        })
      ]).start()
    }

  }, [tabIndex, tabsLayout])

  return (
    <View style={styles.container}>
      <HeaderButton type="back" onPress={navigation.goBack} />
      {showEditBtn && (
        <TouchableOpacity 
        style={{
          position: 'absolute',
          zIndex: 1000,
          top: PADDING_TOP(IS_SMALL_SCREEN ? 10 : 20),
          [!isRTL ? 'left' : 'right']: IS_SMALL_SCREEN ? 10 : 20,
          flexDirection: isRTL ? 'row-reverse' : 'row'
        }}
        onPress={() => navigation.navigate("ExposuresHistoryEdit")}
        >
          <Text style={{ fontSize: 13, color: MAIN_COLOR }}>{edit}</Text>
          <Icon source={require('../../../assets/main/editHistory.png')} width={9} height={9} customStyles={{ marginHorizontal: 7.5 }} />
        </TouchableOpacity>
      )}

      <View style={styles.headerContainer}>
        <View style={{marginHorizontal: 30}}>
          <Text bold>{title}</Text>
          <Text style={{ fontSize: 14, color: '#6a6a6a', marginTop: 8 }} >{subTitle}</Text>
        </View>
        <View style={{ flexDirection: isRTL ? 'row' : 'row-reverse', justifyContent: 'space-between', paddingHorizontal: HORIZONTAL_PADDING }}>
          <Text
            bold={Boolean(!tabIndex)}
            style={{ fontSize: IS_SMALL_SCREEN ? 14 : 16 }}
            onLayout={({ nativeEvent: { layout } }) => setTabsLayout(state => ({ ...state, 0: layout }))}
            onPress={() => setTabIndex(0)}>{wasNotThere}</Text>
          <Text
            bold={Boolean(tabIndex)}
            style={{ fontSize: IS_SMALL_SCREEN ? 14 : 16 }}
            onLayout={({ nativeEvent: { layout } }) => setTabsLayout(state => ({ ...state, 1: layout }))}
            onPress={() => setTabIndex(1)}>{wasThere}</Text>
        </View>
        <Animated.View style={{
          position: 'absolute',
          height: 2,
          backgroundColor: MAIN_COLOR,
          left: lineAnimLeft,
          width: lineAnimWidth,
          bottom: 0
        }} />
      </View>
      <Animated.View
        style={{
          flexDirection: isRTL ? 'row' : 'row-reverse',
          backgroundColor: '#f7f8fa',
          height: SCREEN_HEIGHT * .75,
          transform: [{ translateX: Animated.multiply(listTranslateAnim, isRTL ? -1 : 1) }]
        }}
      >
        <View>

          <FlatList
            bounces={false}
            contentContainerStyle={styles.listContainer}
            data={wasNotThereList}
            renderItem={({ item }) => (
              <ExposureHistoryListItem isRTL={isRTL} strings={strings} Place={item.properties.Place} fromTime={item.properties.fromTime} showExposureOnMap={() => showMapModal(item)} />)}
            keyExtractor={(_, index) => index.toString()}
            ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={() => <View style={styles.emptyStateContainer}>
              <Icon source={require('../../../assets/main/exposuresSmall.png')} width={32} height={20} customStyles={{ marginBottom: 10 }} />
              <Text style={{ marginBottom: 30 }}>{wasNotThereNoExposure}</Text>
              <Text bold>{keepInstructions}</Text>
            </View>}
          />
        </View>
        <View>

          <FlatList
            bounces={false}
            data={wasThereList}
            contentContainerStyle={styles.listContainer}
            renderItem={({ item }) => (
              <ExposureHistoryListItem
                isRTL={isRTL}
                strings={strings}
                Place={item.properties.Place}
                fromTime={item.properties.fromTime}
                showExposureOnMap={() => showMapModal(item)}
              />)}
            keyExtractor={(_, index) => index.toString()}
            ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={() => (
              <View style={styles.emptyStateContainer}>
                <Icon source={require('../../../assets/main/exposuresSmall.png')} width={32} height={20} customStyles={{ marginBottom: 10 }} />
                <Text style={{ marginBottom: 30 }}>{wasThereNoExposure}</Text>
                <Text bold>{keepInstructions}</Text>
              </View>)
            }
          />
        </View>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff'
  },
  headerContainer: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT * .25,
    paddingTop: PADDING_TOP(IS_SMALL_SCREEN ? 20 : 62),
    justifyContent: 'space-between',
    paddingBottom: IS_SMALL_SCREEN ? 8 : 10,
  },
  listContainer: {
    width: SCREEN_WIDTH,
    flex: 1,
    paddingVertical: 10,
    backgroundColor: '#f7f8fa',
    paddingHorizontal: 12
  },
  emptyStateContainer: {
    flex: 1,
    paddingTop: IS_SMALL_SCREEN ? 60 : 97,
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
