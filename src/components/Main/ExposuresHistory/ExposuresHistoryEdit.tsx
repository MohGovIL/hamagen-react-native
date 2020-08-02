import React, { useState, useCallback, useRef, useMemo } from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import _ from 'lodash';
import { Icon, Text, TouchableOpacity } from '../../common';
import { Store, ExposuresReducer, LocaleReducer, Exposure } from '../../../types';
import ExposureHistoryListItem from './ExposureHistoryListItem';
import { PADDING_TOP, SCREEN_HEIGHT, SCREEN_WIDTH, IS_SMALL_SCREEN, MAIN_COLOR, WHITE, PADDING_BOTTOM } from '../../../constants/Constants';
import { showMapModal } from '../../../actions/GeneralActions';
import { replacePastExposureSelected } from '../../../actions/ExposuresActions';
import * as LocalizedStyles from '../../../constants/LocalizedStyles';

const ExposuresHistoryEdit = ({ navigation }) => {
  const dispatch = useDispatch();
  const { isRTL, strings } = useSelector<Store, LocaleReducer>(state => state.locale);
  const {
    exposuresHistory: { title, subTitle, historyEditFinishBtn, historyEditCancelBtn, BLEWarning },
    scanHome: { wasNotMe, wasMe, }
  } = strings;
  const { pastExposures } = useSelector<Store, ExposuresReducer>(state => state.exposures);
  // clone for imutablity purpose
  const [newExposureArr, setNewExposureArray] = useState(_.cloneDeep(pastExposures));

  const showBLEWarning = useMemo(() => pastExposures.some(({ properties }: Exposure) => properties.BLETimestamp), [pastExposures]);

  const setSelected = (index, wasThere) => {
    setNewExposureArray((exposureArrState) => {
      // must be immutable
      const newArr = [...exposureArrState];
      newArr[index].properties.wasThere = wasThere;
      return newArr;
    });
  };

  const finishEdit = () => {
    // check if change at all
    const oldExposureState = _.cloneDeep(pastExposures);
    // commit changes and check diff from pastExposures
    dispatch(replacePastExposureSelected(newExposureArr));

    // user had at least one exposure detected
    const wasChanged = oldExposureState.reduce((dif, exposure, index) => {
      if (exposure.properties.wasThere !== newExposureArr[index].properties.wasThere) {
        dif.push({
          index,
          from: exposure.properties.wasThere,
          to: newExposureArr[index].properties.wasThere
        });
      }
      return dif;
    }, []);


    if (wasChanged.length === 0) {
      // no change
      navigation.goBack();
    } else if (newExposureArr.every(exposure => !exposure.properties.wasThere)) {
      // user changed all to was not there
      navigation.replace('ExposureHistoryRelief');
    } else if (oldExposureState.some(exposure => exposure.properties.wasThere)) {
      // check if user changes wasThere from false to true when he already had at least on exposure true
      if (wasChanged.some(({ from, to }) => from === false && to === true)) {
        navigation.reset({
          index: 0,
          routes: [{ name: 'ScanHome' }, { name: 'ExposureInstructions', params: { showEdit: false, update: true } }]
        });
      } else {
        navigation.goBack();
      }
    } else {
      // user had no exposure was there
      if (newExposureArr.some(exposure => exposure.properties.wasThere)) {
        navigation.reset({
          index: 0,
          routes: [{ name: 'ScanHome' }, { name: 'ExposureInstructions', params: { showEdit: false, update: false } }]
        });
      } else {
        navigation.goBack();
      }
    }
  };


  return (
    <View style={styles.container}>
      <FlatList
        bounces={false}
        data={newExposureArr}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContainer}
        keyExtractor={(item: Exposure) => {
          if (item?.properties?.BLETimestamp) return item.properties.BLETimestamp.toString();
          return item.properties.OBJECTID.toString();
        }}
        renderItem={({ index, item }) => (
          <RenderExposure
            item={item}
            index={index}
            isRTL={isRTL}
            strings={strings}
            showExposureOnMap={() => dispatch(showMapModal(item))}
            setSelected={setSelected}
            wasNotMe={wasNotMe}
            wasMe={wasMe}
          />
        )}
        ListHeaderComponent={() => (
          <View style={styles.headerContainer}>
            <View>
              <Text bold>{title}</Text>
              <Text style={styles.headerSubtitle}>{subTitle}</Text>
              {showBLEWarning && (
                <View
                  style={{
                    marginTop: 10,
                    borderRadius: 10,
                    paddingVertical: 10,
                    alignItems: 'center',
                    paddingHorizontal: 16,
                    flexDirection: LocalizedStyles.flexDirection(isRTL),
                    backgroundColor: 'rgb(242,250,253)',
                  }}
                >
                  <Icon
                    width={16}
                    source={require('../../../assets/main/moreInfo.png')}
                    customStyles={{
                      [LocalizedStyles.marginSide(isRTL, true)]: 8
                    }}
                  />
                  <Text
                    style={{
                      fontSize: 13,
                      color: 'rgb(106,106,106)'
                    }}
                  >
                    {BLEWarning}
                  </Text>
                </View>
              )}
            </View>
          </View>
        )}
      />
      <View style={[styles.buttonsContainer, { flexDirection: LocalizedStyles.flexDirection(isRTL, true), }]}>
        <TouchableOpacity
          style={{ flex: 1, backgroundColor: MAIN_COLOR, justifyContent: 'center' }}
          onPress={finishEdit}
        >
          <Text style={[styles.footerBtnText, { color: WHITE }]} bold>{historyEditFinishBtn}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={{ flex: 1, backgroundColor: '#efefef', justifyContent: 'center' }}
          onPress={navigation.goBack}
        >
          <Text style={[styles.footerBtnText]}>{historyEditCancelBtn}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};


const RenderExposure = ({ index, item, isRTL, strings, showExposureOnMap, setSelected, wasMe, wasNotMe }) => {
  const { wasThere, BLETimestamp, Place } = item.properties;

  const [wasThereSelected, wasNotThereSelected] = useMemo(() => {
    if (wasThere === null) return [false, false];
    return [wasThere, !wasThere];
  }, [wasThere]);

  return (

    <ExposureHistoryListItem
      isRTL={isRTL}
      strings={strings}
      {...item.properties}
      style={{ marginHorizontal: 15, marginBottom: 10, opacity: BLETimestamp ? 0.7 : 1 }}
      showExposureOnMap={showExposureOnMap}
    >
      {!BLETimestamp && Place && (
        <View style={{
          flexDirection: LocalizedStyles.flexDirection(isRTL, true),
          marginTop: 20,

        }}
        >
          <TouchableOpacity
            style={[styles.actionBtnTouch, wasNotThereSelected && styles.actionBtnSelected, { marginHorizontal: 12 }]}
            onPress={() => setSelected(index, false)}
          >
            <Text style={[styles.actionBtnText, wasNotThereSelected && styles.actionBtnSelectedText]} bold={wasNotThereSelected}>{wasNotMe}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionBtnTouch, wasThereSelected && styles.actionBtnSelected]}
            onPress={() => setSelected(index, true)}
          >
            <Text style={[styles.actionBtnText, wasThereSelected && styles.actionBtnSelectedText]} bold={wasThereSelected}>{wasMe}</Text>
          </TouchableOpacity>

        </View>
      )}
    </ExposureHistoryListItem>

  );
};


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7f8fa'
  },
  listContainer: {
    flexGrow: 1,
    paddingBottom: PADDING_BOTTOM(49),

  },
  headerContainer: {
    width: SCREEN_WIDTH,
    paddingTop: PADDING_TOP(IS_SMALL_SCREEN ? 20 : 62),
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: IS_SMALL_SCREEN ? SCREEN_HEIGHT * 0.05 : SCREEN_HEIGHT * 0.03,
    backgroundColor: WHITE,
    marginBottom: 15,
    paddingHorizontal: 20
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#6a6a6a',
    marginTop: 8,
  },
  actionBtnTouch: {
    borderColor: MAIN_COLOR,
    borderWidth: 1,
    borderRadius: 5.6,
    minWidth: SCREEN_WIDTH * 0.3,
    maxWidth: SCREEN_WIDTH * 0.4,
    padding: 5,
    alignItems: 'center',
    justifyContent: 'center'
    
  },
  actionBtnText: {
    fontSize: IS_SMALL_SCREEN ? 10 : 12,

  },
  actionBtnSelected: {
    backgroundColor: MAIN_COLOR,
  },
  actionBtnSelectedText: {
    color: WHITE
  },
  footerBtnText: {
    fontSize: 14,
  },
  buttonsContainer: {
    width: SCREEN_WIDTH,
    height: PADDING_BOTTOM(49)
  }
});

export default ExposuresHistoryEdit;
