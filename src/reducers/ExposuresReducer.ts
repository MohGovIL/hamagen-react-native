import _ from 'lodash';
import { Exposure, ReducerAction } from '../types';
import {
  DISMISS_EXPOSURE,
  REMOVE_VALID_EXPOSURE,
  RESET_EXPOSURES,
  SET_VALID_EXPOSURE,
  UPDATE_EXPOSURES,
  UPDATE_PAST_EXPOSURES,
  UPDATE_FIRST_POINT
} from '../constants/ActionTypes';

interface ExposuresReducer {
  exposures: Exposure[],
  pastExposures: Exposure[],
  validExposure?: Exposure,
  firstPoint?: number
}

const INITIAL_STATE = {
  exposures: [],
  pastExposures: [],
  validExposure: undefined,
  firstPoint: undefined
};

export default (state: ExposuresReducer = INITIAL_STATE, action: ReducerAction) => {
  switch (action.type) {
    case UPDATE_EXPOSURES: {
      const { exposures } = action.payload;
      return { ...state, exposures: _.sortBy([...state.exposures, ...exposures], exposure => exposure.properties.fromTime).reverse() };
    }

    case SET_VALID_EXPOSURE: {
      const { validExposure } = action.payload;
      return { ...state, validExposure };
    }

    case REMOVE_VALID_EXPOSURE: {
      return { ...state, validExposure: undefined };
    }

    case UPDATE_PAST_EXPOSURES: {
      const { pastExposures } = action.payload;
      return { ...state, pastExposures: [...state.pastExposures, ...pastExposures] };
    }

    case DISMISS_EXPOSURE: {
      const { exposureId } = action.payload;
      return { ...state, exposures: state.exposures.filter(exposure => exposure.properties.OBJECTID !== exposureId) };
    }

    case RESET_EXPOSURES: {
      return { ...state, exposures: [], pastExposures: [] };
    }

    case UPDATE_FIRST_POINT: {
      return { ...state, firstPoint: action.payload };
    }

    default:
      return state;
  }
};
