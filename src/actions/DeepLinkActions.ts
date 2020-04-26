import axios from 'axios';
import { toggleLoader } from './GeneralActions';
import { queryDB } from '../services/Tracker';
import { onError } from '../services/ErrorService';
import { DBLocation } from '../types';
import config from '../config/config';

export const ShareUserLocations = (token: string) => async (dispatch: any, getState: any) => new Promise(async (resolve, reject) => {
  const { locale: { strings: { general: { error } } } } = getState();
  
  try {
    dispatch(toggleLoader(true));
    
    const locations: DBLocation[] = await queryDB();
    const dataRows = locations.map(location => ({ ...location, _long: location.long }));

    await axios.post(config().dataShareUrl, { token, dataRows });

    dispatch(toggleLoader(false));
    resolve();
  } catch (e) {
    reject();
    onError({ error: e, showError: false, messageToShow: error });
  }
});
