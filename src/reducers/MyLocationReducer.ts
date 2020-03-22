import { ReducerAction } from '../types';
import {
  UPDATE_MY_LOCATIONS,
  DELETE_ALL_LOCATIONS
} from '../constants/ActionTypes';

interface MyLocationReducer {
  latelyEnteredPoints: any []
}

const INITIAL_STATE = {
  latelyEnteredPoints: []
};

export default (state: MyLocationReducer = INITIAL_STATE, action: ReducerAction) => {
  switch (action.type) {
    case UPDATE_MY_LOCATIONS: {
      return { ...state, latelyEnteredPoints: [...state.latelyEnteredPoints, action.payload] };
    }

    case DELETE_ALL_LOCATIONS: {
      return { ...state, latelyEnteredPoints: [] };
    }


    default:
      return state;
  }
};
