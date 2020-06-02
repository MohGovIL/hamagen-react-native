import AsyncStorage from '@react-native-community/async-storage';
import moment from 'moment';
import { onError } from '../services/ErrorService';
import { Exposure, ExposuresReducer } from '../types';
import {
  SET_VALID_EXPOSURE,
  REMOVE_VALID_EXPOSURE,
  UPDATE_EXPOSURES,
  UPDATE_PAST_EXPOSURES,
  DISMISS_EXPOSURE,
  REPLACE_EXPOSURES,
  REPLACE_PAST_EXPOSURES
} from '../constants/ActionTypes';
import { DISMISSED_EXPOSURES, VALID_EXPOSURE } from '../constants/Constants';
import { IntersectionSickDatabase } from '../database/Database';

export const setExposures = (exposures: Exposure[]) => async (dispatch: any) => {
  // await AsyncStorage.removeItem(DISMISSED_EXPOSURES)
  const dismissedExposures = await AsyncStorage.getItem(DISMISSED_EXPOSURES);

  let filteredExposures = exposures;

  if (dismissedExposures) {
    const parsedDismissedExposures: number[] = JSON.parse(dismissedExposures);

    filteredExposures = exposures.filter(exposure => {
      if(exposure.properties?.BLETimestamp){
        return !parsedDismissedExposures.includes(exposure.properties?.BLETimestamp)
      } else {
        return !parsedDismissedExposures.includes(exposure.properties.OBJECTID)
      }
    });
  }

  dispatch({ type: UPDATE_EXPOSURES, payload: { exposures: filteredExposures } });
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

export const dismissExposures = () => async (dispatch: any, getState: any) => {
  const { exposures }: ExposuresReducer = getState().exposures;
  
  const dismissedExposures = await AsyncStorage.getItem(DISMISSED_EXPOSURES);
  if (dismissedExposures) {
    const parsedDismissedExposures: number[] = JSON.parse(dismissedExposures);
    // Set ensures no OBJECTID duplicates
    const dismissedExposureSet = new Set(exposures.map(({ properties }: Exposure) => properties.BLETimestamp || properties.OBJECTID).concat(parsedDismissedExposures));
    
    await AsyncStorage.setItem(DISMISSED_EXPOSURES, JSON.stringify([...dismissedExposureSet]));
  } else {
    
    await AsyncStorage.setItem(DISMISSED_EXPOSURES, JSON.stringify(exposures.map(({ properties }: Exposure) => properties.BLETimestamp || properties.OBJECTID)));
  }
}

export const setExposureSelected = ({ index, wasThere }) => (dispatch: any, getState: any) => {
  const exposures = [...getState().exposures.exposures];
  exposures[index].properties.wasThere = wasThere;

  dispatch({ type: REPLACE_EXPOSURES, payload: { exposures } });
  new IntersectionSickDatabase().updateSickRecord(exposures[index]).catch(console.log);
};

export const replacePastExposureSelected = (payload: Exposure[]) => async (dispatch: any) => {
  dispatch({ type: REPLACE_PAST_EXPOSURES, payload });

  const dbSick = new IntersectionSickDatabase();

  // TODO: make it a bulk update in one go
  for await (const exposure of payload) {
    dbSick.updateSickRecord(exposure);
  }
};

export const moveAllToPastExposures = () => async (dispatch: any, getState: any) => {
  dispatch({ type: REPLACE_EXPOSURES, payload: { exposures: [] } })
}

export const updateGeoPastExposure = (exposureToReplace: Exposure) => (dispatch: any, getState: any) => {
  const { pastExposures }: ExposuresReducer = getState().exposures;
  const index = pastExposures.findIndex((exposure: Exposure) => exposureToReplace.properties.OBJECTID === exposure.properties.OBJECTID)

  if (index !== -1) {
    pastExposures[index] = exposureToReplace
    dispatch({ type: REPLACE_PAST_EXPOSURES, payload: pastExposures })
  }
}


export const updateBlePastExposure = (exposureToReplace: Exposure) => (dispatch: any, getState: any) => {
  const { pastExposures }: ExposuresReducer = getState().exposures;
  const index = pastExposures.findIndex((exposure: Exposure) => exposureToReplace.properties.BLETimestamp === exposure.properties.BLETimestamp)

  if (index !== -1) {
    pastExposures[index] = exposureToReplace
    dispatch({ type: REPLACE_PAST_EXPOSURES, payload: pastExposures })
  }
}