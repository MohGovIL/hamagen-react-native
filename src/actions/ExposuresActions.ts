import AsyncStorage from '@react-native-community/async-storage';
import moment from 'moment';
import { onError } from '../services/ErrorService';
import { Exposure } from '../types';
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

interface dismissedExposures {
  OBJECTID: number,
  wasThere: boolean
}


export const setExposures = (exposures: Exposure[]) => async (dispatch: any) => {
  const dismissedExposures = await AsyncStorage.getItem(DISMISSED_EXPOSURES);

  let filteredExposures;
  let pastExposures: Exposure[] = exposures;

  if (dismissedExposures) {
    const parsedDismissedExposures: number[] | dismissedExposures[] = JSON.parse(dismissedExposures);
    filteredExposures = exposures.filter((exposure: Exposure) => parsedDismissedExposures.some((item: number | dismissedExposures) => {
      if (typeof item === 'number') {
        return item !== exposure.properties.OBJECTID;
      }
      return item.OBJECTID !== exposure.properties.OBJECTID;
    }));
    pastExposures = exposures.map((expo) => {
      if (parsedDismissedExposures.some((item: number | dismissedExposures) => {
        if (typeof item === 'number') {
          return item === expo.properties.OBJECTID;
        }
        return item.OBJECTID === expo.properties.OBJECTID;
      })) {
        if (typeof parsedDismissedExposures === 'number') {
          expo.properties.wasThere = !!parsedDismissedExposures;
        } else {
          const { wasThere } = parsedDismissedExposures.find(({ OBJECTID }) => expo.properties.OBJECTID === OBJECTID);
          expo.properties.wasThere = wasThere ?? false;
        }
      }
      return expo;
    });
  }

  dispatch({ type: UPDATE_EXPOSURES, payload: { exposures: filteredExposures || exposures } });
  dispatch({ type: UPDATE_PAST_EXPOSURES, payload: { pastExposures } });

  if (dismissedExposures) {
    const parsedDismissedExposures: number[] = JSON.parse(dismissedExposures);
    // check if first item in array is number
    if (typeof parsedDismissedExposures[0] === 'number') {
      const convertExposureToString: string = JSON.stringify(parsedDismissedExposures.map((OBJECTID: number) => {
        if (typeof OBJECTID !== 'number') return OBJECTID;
        return ({
          OBJECTID,
          wasThere: false
        });
      }));

      await AsyncStorage.setItem(DISMISSED_EXPOSURES, convertExposureToString);
    }
  }
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

export const setExposureSelected = ({ index, wasThere }) => async (dispatch: any, getState: any) => {
  const exposures = [...getState().exposures.exposures];
  exposures[index].properties.wasThere = wasThere;

  dispatch({ type: REPLACE_EXPOSURES, payload: { exposures } });
  const dismissedExposures = await AsyncStorage.getItem(DISMISSED_EXPOSURES);
  if (dismissedExposures) {
    const parsedDismissedExposures: number[] | dismissedExposures[] = JSON.parse(dismissedExposures);
    // avoid duplicates
    const idx: number = parsedDismissedExposures.findIndex((item: number | dismissedExposures) => {
      if (typeof item === 'number') {
        return exposures[index].properties.OBJECTID === item;
      }
      return exposures[index].properties.OBJECTID === item.OBJECTID;
    });
    if (idx > -1) {
      if (typeof parsedDismissedExposures[idx] === 'number') {
        parsedDismissedExposures[idx] = { OBJECTID: exposures[index].properties.OBJECTID, wasThere };
      } else {
        parsedDismissedExposures[idx].wasThere = wasThere;
      }
    } else {
      parsedDismissedExposures.push({ OBJECTID: exposures[index].properties.OBJECTID, wasThere });
    }
    await AsyncStorage.setItem(DISMISSED_EXPOSURES, JSON.stringify(parsedDismissedExposures));
  } else {
    await AsyncStorage.setItem(DISMISSED_EXPOSURES, JSON.stringify([{ OBJECTID: exposures[index].properties.OBJECTID, wasThere }]));
  }
};

export const replacePastExposureSelected = (payload: Exposure[]) => async (dispatch: any) => {
  dispatch({ type: REPLACE_PAST_EXPOSURES, payload });

  await AsyncStorage.setItem(DISMISSED_EXPOSURES, JSON.stringify(payload.map((exposure: Exposure) => ({
    OBJECTID: exposure.properties.OBJECTID,
    wasThere: exposure.properties.wasThere
  }))));
};
