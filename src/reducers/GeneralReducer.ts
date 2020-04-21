import { GeneralReducer, ReducerAction } from '../types';
import {
  TOGGLE_LOADER,
  TOGGLE_WEBVIEW,
  SHOW_FORCE_UPDATE,
  HIDE_FORCE_UPDATE,
  SHOW_FORCE_TERMS,
  HIDE_FORCE_TERMS,
  HIDE_LOCATION_HISTORY
} from '../constants/ActionTypes';
import { USAGE_PRIVACY } from '../constants/Constants';

const INITIAL_STATE = {
  showLoader: false,
  showWebview: false,
  showForceUpdate: false,
  shouldForce: false,
  showForceTerms: false,
  usageType: USAGE_PRIVACY,
  termsVersion: 0,
  hideLocationHistory: false
};

export default (state: GeneralReducer = INITIAL_STATE, action: ReducerAction) => {
  switch (action.type) {
    case TOGGLE_LOADER: {
      const { isShow } = action.payload;
      return { ...state, showLoader: isShow };
    }

    case TOGGLE_WEBVIEW: {
      const { isShow, usageType } = action.payload;
      return { ...state, showWebview: isShow, usageType };
    }

    case SHOW_FORCE_UPDATE: {
      const { shouldForce } = action.payload;
      return { ...state, showForceUpdate: true, shouldForce };
    }

    case HIDE_FORCE_UPDATE: {
      return { ...state, showForceUpdate: false };
    }

    case SHOW_FORCE_TERMS: {
      const { terms } = action.payload;
      return { ...state, showForceTerms: true, termsVersion: terms || state.termsVersion };
    }

    case HIDE_FORCE_TERMS: {
      return { ...state, showForceTerms: false };
    }

    case HIDE_LOCATION_HISTORY: {
      return { ...state, hideLocationHistory: true };
    }

    default:
      return state;
  }
};
