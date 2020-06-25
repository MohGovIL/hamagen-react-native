import React, { FunctionComponent, useEffect, useState } from 'react';
import { View, StyleSheet, AppState } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { useRoute, useIsFocused } from '@react-navigation/native';
import { ActionButton, Text, Icon, TouchableOpacity } from '.';
import { IS_SMALL_SCREEN, MAIN_COLOR, USAGE_PRIVACY, SCREEN_WIDTH } from '../../constants/Constants';
import { Store, LocaleReducer } from '../../types';
import { toggleWebview } from '../../actions/GeneralActions';
import { askToDisableBatteryOptimization } from '../../services/BLEService';


interface Props {
  onEnd(): void
}

const BatteryPermission: FunctionComponent<Props> = ({ onEnd }) => {
  // const [userPressed,setUserPressed] = useState(false)
  const dispatch = useDispatch();
  const { strings: {
    general: { additionalInfo },
    battery: { title, description, approveButton, callToAction }
  }
  } = useSelector<Store, LocaleReducer>(state => state.locale);
  
  const { params } = useRoute();

  return (
    <>
      <View style={[{ alignItems: 'center', paddingHorizontal: IS_SMALL_SCREEN ? 20 : 40 }, IS_SMALL_SCREEN && { paddingTop: 5 }]}>
        {!IS_SMALL_SCREEN && (
          <Icon
            width={80}
            customStyles={{ marginBottom: 20 }}
            source={require('../../assets/onboarding/batteryBig.jpg')}
          />
        )}
        <Text style={styles.title} bold>{title}</Text>
        <Text style={styles.description}>{description}</Text>
        <Text style={styles.callToAction} bold>{callToAction}</Text>
      </View>
      <View style={{ alignItems: 'center' }}>
        <ActionButton
          text={approveButton}
          onPress={() => { 
            askToDisableBatteryOptimization(onEnd);
          }}
          containerStyle={{ marginBottom: 20 }}
        />
        {params?.showUsageLink && (
          <View style={styles.termsWrapper}>
            <TouchableOpacity onPress={() => dispatch(toggleWebview(true, USAGE_PRIVACY))}>
              <Text style={{ fontSize: 14, letterSpacing: 0.26 }}>{additionalInfo}</Text>
              <View style={styles.bottomBorder} />
            </TouchableOpacity>
          </View>
        )}
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  lottie: {
    height: 120,
    marginBottom: 20
  },
  title: {
    fontSize: 22,
    marginBottom: 25
  },
  description: {
    lineHeight: 24,
    marginBottom: 25
  },
  callToAction: {
    lineHeight: 22,
    color: '#4d4d4d'
  },
  bottomBorder: {
    alignSelf: 'stretch',
    height: 2,
    borderRadius: 1,
    backgroundColor: MAIN_COLOR
  },
  termsWrapper: {
    width: SCREEN_WIDTH * 0.7,
    alignItems: 'center'
  }
});

export default BatteryPermission;
