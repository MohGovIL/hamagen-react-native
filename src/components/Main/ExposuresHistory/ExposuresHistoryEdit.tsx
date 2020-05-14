import React, { useState, useCallback, useRef, useMemo } from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { Icon, Text, TouchableOpacity } from '../../common';
import { Store, ExposuresReducer, LocaleReducer, Exposure } from '../../../types';
import ExposureHistoryListItem from './ExposureHistoryListItem';
import { PADDING_TOP, SCREEN_HEIGHT, SCREEN_WIDTH, IS_SMALL_SCREEN, MAIN_COLOR, HIT_SLOP, WHITE, PADDING_BOTTOM } from '../../../constants/Constants';
import { showMapModal } from '../../../actions/GeneralActions';
import { REPLACE_PAST_EXPOSURES } from '../../../constants/ActionTypes';
import _ from 'lodash';


const ExposureItem = () => {
  return <Text>item</Text>
}

const ExposuresHistoryEdit = ({ navigation }) => {
  const dispatch = useDispatch()
  const { isRTL, strings } = useSelector<Store, LocaleReducer>(state => state.locale)
  const {
    exposuresHistory: { title, subTitle, historyEditFinishBtn, historyEditCancelBtn },
    scanHome: { wasNotMe, wasMe, }
  } = strings;
  const { pastExposures } = useSelector<Store, ExposuresReducer>(state => state.exposures)
  const [newExposureArr, setNewExposureArray] = useState(_.cloneDeep(pastExposures))

  const setSelected = (index, wasThere) => {
    setNewExposureArray(exposureArrState => {
      // must be immutable
      const newArr = [...exposureArrState]
      newArr[index].properties.wasThere = wasThere
      return newArr
    })
  }

  const finishEdit = () => {
    // check if change at all
    const oldExposureState = _.cloneDeep(pastExposures)
    // commit changes and check diff from pastExposures
    dispatch({ type: REPLACE_PAST_EXPOSURES, payload: [...newExposureArr] })

    // user had at least one exposure detected
    const wasChanged = oldExposureState.reduce((dif, exposure, index) => {
      if (exposure.properties.wasThere !== newExposureArr[index].properties.wasThere) {
        dif.push({
          index,
          from: exposure.properties.wasThere,
          to: newExposureArr[index].properties.wasThere
        })
      }
      return dif
    }, [])


    if (wasChanged.length === 0) {
      // no change
      navigation.goBack()

    } else if (newExposureArr.every(exposure => !exposure.properties.wasThere)) {
      // user changed all to was not there
      navigation.replace("ExposureHistoryRelief")
    } else if (oldExposureState.some(exposure => exposure.properties.wasThere)) {
      // check if user changes wasThere from false to true when he already had at least on exposure true
      if (wasChanged.some(({ from, to }) => from === false && to === true)) {
        navigation.reset({
          index: 0,
          routes: [{ name: "ScanHome" }, { name: "ExposureInstructions", params: { showEdit: false, update: true } }]
        })
      } else {
        navigation.goBack()
      }

    } else {
      // user had no exposure was there
      if (newExposureArr.some(exposure => exposure.properties.wasThere)) {
        navigation.reset({
          index: 0,
          routes: [{ name: "ScanHome" }, { name: "ExposureInstructions", params: { showEdit: false, update: false } }]
        })
      } else {
        navigation.goBack()
      }
    }


  }

  const RenderExposure = ({ index, item }) => {
    const { wasThere, Place, fromTime } = item.properties
    const [wasThereSelected, wasNotThereSelected] = useMemo(() => {
      if (wasThere === undefined) return [false, false]
      return [wasThere, !wasThere]
    }, [wasThere])

    return (
      <ExposureHistoryListItem
        isRTL={isRTL}
        strings={strings}
        Place={Place}
        fromTime={fromTime}
        style={{ marginHorizontal: 15 }}
        showExposureOnMap={() => dispatch(showMapModal(item))} >
        <View style={{
          flexDirection: 'row',
          marginTop: 20,

        }}>
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
      </ExposureHistoryListItem>
    )
  }

  return (
    <View style={{ flex: 1 }}>
      <FlatList
        bounces={false}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContainer}
        data={newExposureArr}
        renderItem={({ index, item }) => <RenderExposure item={item} index={index} />}
        keyExtractor={(_, index) => index.toString()}
        ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
        ListHeaderComponent={() => (
          <View style={styles.headerContainer}>
            <View>
              <Text bold>{title}</Text>
              <Text style={{ fontSize: 14, color: '#6a6a6a', marginTop: 8 }} >{subTitle}</Text>
            </View>
          </View>
        )}
      />
      <View style={{ flexDirection: isRTL ? 'row' : 'row-reverse', width: SCREEN_WIDTH, height: PADDING_BOTTOM(49) }}>
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
          <Text style={[styles.footerBtnText]} >{historyEditCancelBtn}</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  listContainer: {
    flex: 1,
    backgroundColor: '#f7f8fa'
  },
  headerContainer: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT * .2,
    paddingTop: PADDING_TOP(IS_SMALL_SCREEN ? 20 : 62),
    justifyContent: 'space-between',
    paddingBottom: IS_SMALL_SCREEN ? 8 : 10,
    backgroundColor: WHITE,
    marginBottom: 15,

  },
  actionBtnTouch: {
    borderColor: MAIN_COLOR,
    borderWidth: 1,
    borderRadius: 5.6,
    padding: 10,
    justifyContent: 'center'
  },
  actionBtnText: {
    fontSize: IS_SMALL_SCREEN ? 12 : 12
  },
  actionBtnSelected: {
    backgroundColor: MAIN_COLOR,
  },
  actionBtnSelectedText: {
    color: WHITE
  },
  footerBtnText: {
    fontSize: 14,

  }
})

export default ExposuresHistoryEdit
