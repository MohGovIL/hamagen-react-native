import React, { useState, useCallback, useRef, useMemo, useEffect } from 'react';
import { View, StyleSheet, Animated, ScrollView, FlatList } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import moment from 'moment';
import { FadeInView, Icon, Text, TouchableOpacity } from '../common';
import { Strings } from '../../locale/LocaleData';
import { Exposure, Store, LocaleReducer, ExposuresReducer } from '../../types';
import {
  BASIC_SHADOW_STYLES,
  IS_SMALL_SCREEN,
  MAIN_COLOR,
  PADDING_BOTTOM,
  SCREEN_WIDTH,
  SCREEN_HEIGHT,
  WHITE,
  INIT_ROUTE_NAME
} from '../../constants/Constants';
import { showMapModal } from '../../actions/GeneralActions';
import { dismissExposure, setExposureSelected } from '../../actions/ExposuresActions';
import { StackNavigationProp } from '@react-navigation/stack';
import { useFocusEffect } from '@react-navigation/native';
import SplashScreen from 'react-native-splash-screen';
import AsyncStorage from '@react-native-community/async-storage';

interface ExposuresDetectedProps {
  navigation: StackNavigationProp<any>
}

interface RenderExposureProps {
  index: number,
  exposure: Exposure
}


const ExposuresDetected = ({ navigation }: ExposuresDetectedProps) => {

  const dispatch = useDispatch()
  const { isRTL, strings: { scanHome: { inDate, fromHour, wereYouThere, wasNotMe, wasMe, doneBtn, suspectedExposure, events, possibleExposure, atPlace, showOnMap } } } = useSelector<Store, LocaleReducer>(state => state.locale)
  const { exposures } = useSelector<Store, ExposuresReducer>(state => state.exposures)
  const [anim] = useState(new Animated.Value(SCREEN_HEIGHT * 0.08));
  const flatListRef = useRef(null)

  useEffect(() => {
    SplashScreen.hide();
    AsyncStorage.setItem(INIT_ROUTE_NAME, 'ExposuresDetected')
  }, [])

  // show button when moving to another page
  //  use case for single exposure. the user moves on click but if he returns for edit 
  useFocusEffect(
    useCallback(() => {
      if (exposures.every(exposure => exposure.properties.wasThere !== undefined)) {
        Animated.timing(anim, {
          toValue: 0,
          duration: 0,
          useNativeDriver: true,
          delay: 300
        }).start()
      }
    }, [])
  )

  const setSelected = (index: number, wasThere: boolean) => {
    dispatch(setExposureSelected({ index, wasThere }))
    if (exposures.length === 1) {
      editDone()
    } else {
      // find index of first card user didn't checked(was or not) and go to there˝
      const emptyIndex = exposures.findIndex(exposure => exposure.properties.wasThere === undefined)

      if (emptyIndex === -1) {
        Animated.timing(anim, { toValue: 0, duration: 300, useNativeDriver: true, delay: 300 }).start()
      } else if (index + 1 < exposures.length) {
        setTimeout(() => {
          if (flatListRef?.current)
            flatListRef?.current?.scrollToIndex({
              index: index + 1,
              viewOffset: 10
            })
        }, 300)
      } else {


        // all selected show finish button and findIndex get me last index
        if (emptyIndex === -1 || exposures.length - 1 === emptyIndex) {

          Animated.timing(anim, { toValue: 0, duration: 300, delay: 300, useNativeDriver: true }).start()
        } else {
          flatListRef?.current?.scrollToIndex({
            index: emptyIndex,
            viewOffset: 10
          })
        }
      }
    }
  }

  const editDone = () => {
    // check if at least one exposure was checked a been there
    const isExposed = exposures.some((exposure: Exposure) => exposure.properties.wasThere)

    if (isExposed) {
      // move to ExposureInstructions
      navigation.navigate('ExposureInstructions', { showEdit: true })
    } else {
      // move to ExposureRelief
      navigation.navigate('ExposureRelief')
      AsyncStorage.removeItem(INIT_ROUTE_NAME)
    }
  }

  const RenderExposure = ({ index, exposure: { properties: { Place, fromTime, OBJECTID, wasThere } } }: RenderExposureProps) => {
    const [wasThereSelected, wasNotThereSelected] = useMemo(() => {
      if (wasThere === undefined) return [false, false]
      return [wasThere, !wasThere]
    }, [wasThere])

    return (
      <Animated.View key={OBJECTID} style={[styles.detailsContainer]}>
        <View style={{ alignItems: 'center' }}
        >
          <Text style={styles.exposureLength}>{`${index + 1}/${exposures.length}`}</Text>
          <Text style={styles.exposureCardTitle}>{possibleExposure}</Text>
          <Text style={styles.exposureCardPlace} bold>
            {`${atPlace}${Place} ${inDate} ${moment(fromTime).format('DD.MM.YY')} ${fromHour} ${moment(fromTime).format('HH:mm')}`}
          </Text>
          <View style={styles.exposureCardMapContainer}>
            <Text style={styles.exposureCardMapText} onPress={() => dispatch(showMapModal(exposures[0]))}>{showOnMap}</Text>
          </View>
        </View>
        <View>
          <Text style={styles.actionBtnTitle}>{wereYouThere}</Text>
          <View style={styles.actionBtnContainer}>
            <TouchableOpacity
              style={[styles.actionBtnTouch, wasThereSelected && styles.actionBtnSelected]}
              onPress={() => setSelected(index, true)}
            >
              <Text style={[styles.actionBtnText, wasThereSelected && styles.actionBtnSelectedText]} bold={wasThereSelected}>{wasMe}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionBtnTouch, wasNotThereSelected && styles.actionBtnSelected]}
              onPress={() => setSelected(index, false)}
            >
              <Text style={[styles.actionBtnText, wasNotThereSelected && styles.actionBtnSelectedText]} bold={wasNotThereSelected} >{wasNotMe}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Animated.View>
    )
  }

  return (
    <>
      <ScrollView
        contentContainerStyle={styles.container}
        bounces={false}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ alignItems: 'center', marginBottom: IS_SMALL_SCREEN ? 10 : 42 }}>
          <Icon source={require('../../assets/main/exposures.png')} width={IS_SMALL_SCREEN ? 66 : 99} height={IS_SMALL_SCREEN ? 40 : 59} customStyles={{ marginBottom: 33 }} />
          <Text style={styles.title} bold>{`${suspectedExposure} ${exposures.length} ${events}`}</Text>
        </View>

        <FlatList
          horizontal
          ref={flatListRef}
          data={exposures}
          keyExtractor={(item: Exposure) => item.properties.OBJECTID.toString()}
          renderItem={({ item, index }) => <RenderExposure exposure={item} index={index} />}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingLeft: 14, paddingRight: 5 }}
        />
      </ScrollView>
      <Animated.View style={{ transform: [{ translateY: anim }] }}>
        <TouchableOpacity
          onPress={editDone}
          style={{
            width: SCREEN_WIDTH,
            height: SCREEN_HEIGHT * 0.08,
            backgroundColor: MAIN_COLOR,
            justifyContent: 'center',
            flexDirection: isRTL ? 'row-reverse' : 'row',
            alignItems: 'center',
            paddingBottom: PADDING_BOTTOM()
          }}
        >
          <Icon
            source={require('../../assets/main/imDoneUpdate.png')}
            width={IS_SMALL_SCREEN ? 12 : 14}
            height={IS_SMALL_SCREEN ? 10 : 12}
          />
          <Text style={{ fontSize: IS_SMALL_SCREEN ? 15 : 18, color: 'white', marginHorizontal: 6 }} bold>{doneBtn}</Text>
        </TouchableOpacity>
      </Animated.View>
    </>
  );
};



const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    paddingTop: PADDING_BOTTOM(45),

  },
  title: {
    fontSize: IS_SMALL_SCREEN ? 18 : 22,
    marginBottom: 4
  },
  detailsContainer: {
    ...BASIC_SHADOW_STYLES,
    height: SCREEN_HEIGHT * 0.55,
    width: SCREEN_WIDTH * 0.88,

    marginRight: 13,
    borderRadius: 8,
    padding: 25,

    justifyContent: 'space-between',
  },
  exposureLength: {
    fontSize: 13,
    marginBottom: 8
  },
  exposureCardTitle: {
    fontSize: 14,
    marginBottom: 18
  },
  exposureCardPlace: {
    fontSize: IS_SMALL_SCREEN ? 14 : 18
  },
  exposureCardMapContainer: {
    marginTop: 12,
    paddingBottom: 3,
    borderBottomWidth: 1.5,
    borderColor: MAIN_COLOR
  },
  exposureCardMapText: {
    fontSize: 14
  },
  actionBtnTitle: {
    marginBottom: 16,
    fontSize: IS_SMALL_SCREEN ? 14 : 16
  },
  actionBtnContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  actionBtnTouch: {
    borderColor: MAIN_COLOR,
    borderWidth: 1,
    borderRadius: 5.6,
    height: SCREEN_HEIGHT * .05,
    width: SCREEN_WIDTH * .3,
    justifyContent: 'center'
  },
  actionBtnText: {
    fontSize: IS_SMALL_SCREEN ? 12 : 16
  },
  actionBtnSelected: {
    backgroundColor: MAIN_COLOR,
  },
  actionBtnSelectedText: {
    color: WHITE
  }
});

export default ExposuresDetected;