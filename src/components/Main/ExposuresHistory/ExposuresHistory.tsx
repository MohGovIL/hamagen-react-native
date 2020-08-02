import React, { useState, useEffect, useMemo } from 'react';
import { View, StyleSheet, FlatList, Animated } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { connect } from 'react-redux';
import { Icon, Text, HeaderButton, TouchableOpacity } from '../../common';
import { Strings } from '../../../locale/LocaleData';
import { Exposure } from '../../../types';
import { PADDING_TOP, SCREEN_WIDTH, IS_SMALL_SCREEN, MAIN_COLOR, HIT_SLOP, WHITE } from '../../../constants/Constants';
import ExposureHistoryListItem from './ExposureHistoryListItem';
import { showMapModal } from '../../../actions/GeneralActions';
import * as LocalizedStyles from '../../../constants/LocalizedStyles';

interface Props {
  navigation: StackNavigationProp<any>,
  isRTL: boolean,
  strings: Strings,
  pastExposures: Exposure[],
  showMapModal(exposures: Exposure): void
}

const LINE_MARGIN = 7;
const ANIMATION_DURATION = 300;


const ExposuresHistory = (
  {
    navigation,
    strings,
    isRTL,
    pastExposures,
    showMapModal
  }: Props
) => {
  const { exposuresHistory: { title, subTitle, wasNotThere, wasThere, wasThereNoExposure, wasNotThereNoExposure, keepInstructions, edit } } = strings;

  const [tabIndex, setTabIndex] = useState(1);
  const wasThereList = pastExposures.filter(({ properties }: Exposure) => properties?.wasThere);
  const wasNotThereList = pastExposures.filter(({ properties }: Exposure) => !properties?.wasThere);
  // show button if list is not empty or all exposures are of type BLE and can't be edited 
  const showEditBtn = useMemo(() => wasThereList.length + wasNotThereList.length > 0 && !pastExposures.every((exposure: Exposure) => exposure.properties.BLETimestamp), [wasThereList, wasNotThereList]);
  const [tabsLayout, setTabsLayout] = useState({});
  const [lineAnimLeft] = useState(new Animated.Value(LocalizedStyles.leading(isRTL)));
  const [lineAnimWidth] = useState(new Animated.Value(0));
  const [listTranslateAnim] = useState(new Animated.Value(LocalizedStyles.leading(isRTL)));
  const [firstLoad, setFirstLoad] = useState(true);

  useEffect(() => {
    // didn't layout yet
    if (tabsLayout?.[tabIndex]) {
      // TODO: make it a pretty function
      Animated.parallel([
        Animated.timing(lineAnimLeft, {
          toValue: tabsLayout[tabIndex].x - LINE_MARGIN + (isRTL ? tabIndex * SCREEN_WIDTH / 2 : SCREEN_WIDTH / 2 * (tabIndex ? 0 : 1)),
          duration: firstLoad ? 0 : ANIMATION_DURATION,
        }),
        Animated.timing(listTranslateAnim, {
          toValue: tabIndex ? SCREEN_WIDTH : 0,
          duration: firstLoad ? 0 : ANIMATION_DURATION,
          useNativeDriver: true
        }),
        Animated.timing(lineAnimWidth, {
          toValue: tabsLayout[tabIndex].width + (LINE_MARGIN * 2),
          duration: firstLoad ? 0 : ANIMATION_DURATION,
        })
      ]).start(() => setFirstLoad(false));
    }
  }, [tabIndex, tabsLayout, isRTL]);

  return (
    <View style={styles.container}>
      <HeaderButton type="back" onPress={navigation.goBack} />

      {showEditBtn && (
        <TouchableOpacity
          hitSlop={HIT_SLOP}
          style={[styles.editButtonContainer, {
            [LocalizedStyles.side(isRTL)]: IS_SMALL_SCREEN ? 10 : 20,
            flexDirection: LocalizedStyles.flexDirection(isRTL)
          }]}
          onPress={() => navigation.navigate('ExposuresHistoryEdit')}
        >
          <Text style={{ fontSize: 13, color: MAIN_COLOR }}>{edit}</Text>
          <Icon source={require('../../../assets/main/editHistory.png')} width={9} height={9} customStyles={{ marginHorizontal: 7.5 }} />
        </TouchableOpacity>
      )}

      <View style={styles.headerContainer}>
        <View style={{ marginHorizontal: 30 }}>
          <Text bold>{title}</Text>
          <Text style={{ fontSize: 14, color: '#6a6a6a', marginVertical: 8 }}>{subTitle}</Text>
        </View>
        <View style={{ flexDirection: LocalizedStyles.flexDirection(isRTL, true) }}>
          <TouchableOpacity
            hitSlop={{ top: 10 }}
            style={styles.tabTextContainer}
            onPress={() => setTabIndex(0)}
          >
            <View style={{
              width: SCREEN_WIDTH / 2,
              alignItems: 'center',
              justifyContent: 'center'
            }}
            >

              <Text
                bold={Boolean(!tabIndex)}
                style={styles.tabText}
                onLayout={({ nativeEvent: { layout } }) => setTabsLayout(state => ({ ...state, 0: layout }))}
              >
                {wasNotThere}
              </Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            hitSlop={{ top: 10 }}
            style={styles.tabTextContainer}
            onPress={() => setTabIndex(0)}
          >
            <View style={{
              alignItems: 'center',
              justifyContent: 'center',
              width: SCREEN_WIDTH / 2,
            }}
            >
              <Text
                bold={Boolean(tabIndex)}
                style={styles.tabText}
                onLayout={({ nativeEvent: { layout } }) => setTabsLayout(state => ({ ...state, 1: layout }))}
                onPress={() => setTabIndex(1)}
              >
                {wasThere}
              </Text>
            </View>
          </TouchableOpacity>
        </View>
        <Animated.View
          style={{
            position: 'absolute',
            height: 2,
            backgroundColor: MAIN_COLOR,
            left: lineAnimLeft,
            width: lineAnimWidth,
            bottom: 0
          }}
        />
      </View>
      <View style={{ flex: 1, flexDirection: LocalizedStyles.flexDirection(isRTL, true), backgroundColor: '#f7f8fa' }}>
        <Animated.View style={{ transform: [{ translateX: Animated.multiply(listTranslateAnim, LocalizedStyles.translateAnim(isRTL)) }] }}>
          <FlatList
            bounces={false}
            contentContainerStyle={styles.listContainer}
            data={wasNotThereList}
            renderItem={({ item }) => (
              <ExposureHistoryListItem isRTL={isRTL} strings={strings} Place={item.properties.Place} fromTime={item.properties.fromTime} showExposureOnMap={() => showMapModal(item)} />)}
            keyExtractor={(_, index) => index.toString()}
            ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={() => (
              <View style={styles.emptyStateContainer}>
                <Icon source={require('../../../assets/main/exposuresSmall.png')} width={32} height={20} customStyles={{ marginBottom: 10 }} />
                <Text style={{ marginBottom: 30 }}>{wasNotThereNoExposure}</Text>
                <Text bold>{keepInstructions}</Text>
              </View>
            )}
          />
        </Animated.View>

        <Animated.View style={{ transform: [{ translateX: Animated.multiply(listTranslateAnim, LocalizedStyles.translateAnim(isRTL)) }] }}>
          <FlatList
            bounces={false}
            data={wasThereList}
            contentContainerStyle={styles.listContainer}
            renderItem={({ item }) => (
              <ExposureHistoryListItem
                isRTL={isRTL}
                strings={strings}
                {...item.properties}
                showExposureOnMap={() => showMapModal(item)}
              />
            )}
            keyExtractor={(_, index) => index.toString()}
            ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={() => (
              <View style={styles.emptyStateContainer}>
                <Icon source={require('../../../assets/main/exposuresSmall.png')} width={32} height={20} customStyles={{ marginBottom: 10 }} />
                <Text style={{ marginBottom: 30 }}>{wasThereNoExposure}</Text>
                <Text bold>{keepInstructions}</Text>
              </View>
            )
            }
          />
        </Animated.View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f7f8fa',
    flex: 1,
  },
  headerContainer: {
    paddingTop: PADDING_TOP(IS_SMALL_SCREEN ? 30 : 60),
    justifyContent: 'space-between',
    paddingBottom: IS_SMALL_SCREEN ? 8 : 10,
    backgroundColor: WHITE
  },
  listContainer: {
    flexGrow: 1,
    width: SCREEN_WIDTH,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  emptyStateContainer: {
    paddingTop: IS_SMALL_SCREEN ? 60 : 97,
    alignItems: 'center',
    paddingHorizontal: IS_SMALL_SCREEN ? 20 : 35
  },
  tabTextContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
  tabText: {
    fontSize: IS_SMALL_SCREEN ? 14 : 16,
    paddingHorizontal: 10,
  },
  editButtonContainer: {
    position: 'absolute',
    zIndex: 1000,
    top: PADDING_TOP(IS_SMALL_SCREEN ? 18 : 30),
    alignItems: 'center',
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
