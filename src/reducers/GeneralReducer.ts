import {
  ENABLE_BLE,
  HIDE_FORCE_TERMS,
  HIDE_FORCE_UPDATE,
  HIDE_LOCATION_HISTORY,
  HIDE_MAP_MODAL,
  SET_ONBOARDING_STATE, SHOW_FORCE_TERMS, SHOW_FORCE_UPDATE,
  SHOW_MAP_MODAL, TOGGLE_LOADER,
  TOGGLE_WEBVIEW,
  USER_DISABLED_BATTERY
} from '../constants/ActionTypes';
import { USAGE_PRIVACY } from '../constants/Constants';
import { GeneralReducer, ReducerAction } from '../types';


const INITIAL_STATE = {
  showLoader: false,
  showWebview: false,
  showForceUpdate: false,
  shouldForce: false,
  showForceTerms: false,
  usageType: USAGE_PRIVACY,
  termsVersion: 0,
  hideLocationHistory: false,
  enableBle: null,
  batteryDisabled: false,
  isOnboarding: true,
  showMap: {
    visible: false,
    region: {
      latitude: 31.4117257,
      longitude: 35.0818155,
      latitudeDelta: 2,
      longitudeDelta: 2
    }
  }
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

    case SHOW_MAP_MODAL: {
      return { ...state, showMap: { visible: true, ...action.payload } };
    }

    case HIDE_MAP_MODAL: {
      return { ...state, showMap: { ...INITIAL_STATE.showMap } };
    }

    case ENABLE_BLE: {
      return { ...state, enableBle: action.payload };
    }

    case USER_DISABLED_BATTERY: {
      return { ...state, batteryDisabled: action.payload };
    }

    case SET_ONBOARDING_STATE: {
      return {...state, isOnboarding: action.payload }
    }

    default:
      return state;
  }
};
