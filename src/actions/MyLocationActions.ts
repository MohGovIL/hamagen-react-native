import { UPDATE_MY_LOCATIONS, DELETE_ALL_LOCATIONS } from '../constants/ActionTypes';

export const updateLocations = (finalSample: any) => (dispatch: any) => {
  console.log('updateLocations');
  dispatch({ type: UPDATE_MY_LOCATIONS, payload: finalSample });
};

export const deleteAllLocations = () => (dispatch: any) => {
  dispatch({ type: DELETE_ALL_LOCATIONS });
};
