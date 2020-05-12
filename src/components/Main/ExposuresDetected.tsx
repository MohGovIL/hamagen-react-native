import React, { useState, useCallback, useRef } from 'react';
import { View, StyleSheet, Animated,ScrollView, FlatList } from 'react-native';
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
  WHITE
} from '../../constants/Constants';
import { showMapModal } from '../../actions/GeneralActions';
import { dismissExposure } from '../../actions/ExposuresActions';

interface Props {
  isRTL: boolean,
  exposures: Exposure[],
  onValidExposure(exposure: Exposure): void,
  dismissExposure(exposureId: number): void,
  showMapModal(exposure: Exposure): void
}

const ExposuresDetected = () => {
  const dispatch = useDispatch()
  const { isRTL, strings: { scanHome: { inDate, fromHour, wereYouThere, wasNotMe, wasMe, suspectedExposure, events, possibleExposure, atPlace, showOnMap } } } = useSelector<Store, LocaleReducer>(state => state.locale)
  const { exposures } = useSelector<Store, ExposuresReducer>(state => state.exposures)
  // TODO: decide if button should be shown or not
  const [anim] = useState(new Animated.Value(SCREEN_HEIGHT * 0.08));
  const flatListRef = useRef(null)
  const onDismissExposure = () => {
    if (exposures.length === 1) {

      dispatch(dismissExposure(exposures[0].properties.OBJECTID))
    } else {
      Animated.timing(anim, { toValue: 0, duration: 200, useNativeDriver: true }).start(() => {
        dispatch(dismissExposure(exposures[0].properties.OBJECTID))
        setTimeout(() => Animated.timing(anim, { toValue: 1, duration: 200, useNativeDriver: true }).start(), 50);
      });
    }
  };

  const setSelected = (index: number, wasThere: boolean) => {
    if(index + 1 < exposures.length) {
      dispatch(setExposureSelected({index, wasThere}))
      flatListRef?.current &&
      flatListRef?.current?.scrollToIndex({
        index: index + 1,
        viewOffset: 10
      })
    } else {
      // find index of first card user didn't checked(was or not) and go to there
      const emptyIndex = exposures.findIndex(exposure => exposure.wasThere === undefined)
      // all selected show finish button
      if(emptyIndex === -1) {
        Animated.timing(anim, { toValue: 0, duration: 300, useNativeDriver: true }).start()
      } else {
        flatListRef?.current?.scrollToIndex({
          index: emptyIndex,
          viewOffset: 10
        })
      }

      // 
    }
    
  }

  const RenderExposure = ({ index,wasThere, properties: { Place, fromTime, OBJECTID } }) => (
    <Animated.View key={OBJECTID} style={[styles.detailsContainer]}>
      <View style={{ alignItems: 'center' }}
      >
        <Text style={styles.exposureLength}>{`1/${exposures.length}`}</Text>
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
            style={styles.actionBtnTouch}
            onPress={() => setSelected(index, true)}
          >
            <Text style={styles.actionBtnText} >{wasMe}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionBtnTouch]}
            onPress={() => setSelected(index, false)}
          >
            <Text style={[styles.actionBtnText]} bold>{wasNotMe}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Animated.View>
  )

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
          renderItem={({item, index }) => <RenderExposure {...item} index={index}/>}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingLeft: 14, paddingRight: 5 }}
        />
         
        
      </ScrollView>
      <Animated.View style={{ transform: [{ translateY: anim }] }}>
        <TouchableOpacity style={{ width: SCREEN_WIDTH, height: SCREEN_HEIGHT * 0.08, backgroundColor: MAIN_COLOR, justifyContent: 'center' }} onPress={() => { }}>
          <Text style={{ fontSize: 18, color: 'white' }} bold>סיימתי</Text>
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
    fontSize: IS_SMALL_SCREEN ? 18 : 22
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
    color: WHITE
  }
});

export default ExposuresDetected;


/* <View style={styles.footer}>
        <Text style={{ marginBottom: 15 }}>{wereYouThere}</Text>

        <View style={[styles.actionButtonsWrapper, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
          {renderActionButton(wasMe, () => onValidExposure(exposures[0]))}
          {renderActionButton(wasNotMe, onDismissExposure)}
        </View>
      </View> */