import { combineReducers } from 'redux';
import LocaleReducer from './LocaleReducer';
import GeneralReducer from './GeneralReducer';
import ExposuresReducer from './ExposuresReducer';
import MyLocationReducer from './MyLocationReducer';

export default combineReducers({
  general: GeneralReducer,
  locale: LocaleReducer,
  exposures: ExposuresReducer,
  MyLocation: MyLocationReducer
});
