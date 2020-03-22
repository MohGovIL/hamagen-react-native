import AsyncStorage from '@react-native-community/async-storage';
import moment from 'moment';
import { onError } from '../services/ErrorService';
import { Exposure } from '../types';
import {
  SET_VALID_EXPOSURE,
  REMOVE_VALID_EXPOSURE,
  UPDATE_EXPOSURES,
  UPDATE_PAST_EXPOSURES,
  DISMISS_EXPOSURE
} from '../constants/ActionTypes';
import { DISMISSED_EXPOSURES, VALID_EXPOSURE } from '../constants/Constants';

export const setExposures = (exposures: Exposure[]) => async (dispatch: any) => {
  const dismissedExposures = await AsyncStorage.getItem(DISMISSED_EXPOSURES);

  let filteredExposures;

  if (dismissedExposures) {
    const parsedDismissedExposures: number[] = JSON.parse(dismissedExposures);
    filteredExposures = exposures.filter(exposure => !parsedDismissedExposures.includes(exposure.properties.OBJECTID));
  }

  dispatch({ type: UPDATE_EXPOSURES, payload: { exposures: filteredExposures || exposures } });
  dispatch({ type: UPDATE_PAST_EXPOSURES, payload: { pastExposures: exposures } });
};

export const setValidExposure = (exposure: Exposure) => async (dispatch: any) => {
  try {
    await AsyncStorage.setItem(VALID_EXPOSURE, JSON.stringify({ exposure, timestamp: moment().valueOf() }));
    dispatch({ type: SET_VALID_EXPOSURE, payload: { validExposure: exposure } });
  } catch (error) {
    onError({ error });
  }
};

export const removeValidExposure = () => async (dispatch: any) => {
  try {
    await AsyncStorage.removeItem(VALID_EXPOSURE);
    dispatch({ type: REMOVE_VALID_EXPOSURE });
  } catch (error) {
    onError({ error });
  }
};

export const dismissExposure = (exposureId: number) => async (dispatch: any) => {
  dispatch({ type: DISMISS_EXPOSURE, payload: { exposureId } });

  const dismissedExposures = await AsyncStorage.getItem(DISMISSED_EXPOSURES);
  if (dismissedExposures) {
    const parsedDismissedExposures: number[] = JSON.parse(dismissedExposures);
    parsedDismissedExposures.push(exposureId);
    await AsyncStorage.setItem(DISMISSED_EXPOSURES, JSON.stringify(parsedDismissedExposures));
  } else {
    await AsyncStorage.setItem(DISMISSED_EXPOSURES, JSON.stringify([exposureId]));
  }
};
