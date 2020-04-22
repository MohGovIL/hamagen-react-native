import { Alert } from 'react-native';
import storeFactory from '../store';
import { ErrorService } from '../types';
import { TOGGLE_LOADER } from '../constants/ActionTypes';

export const onError = ({ error, dispatch, actionType, customAction, showError, messageToShow }: ErrorService) => {
  console.log(error);
  !!dispatch && dispatch({ type: actionType });
  customAction && customAction();
  storeFactory().dispatch({ type: TOGGLE_LOADER, payload: { isShow: false } });
  showError && messageToShow && Alert.alert(messageToShow);
};
