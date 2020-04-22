import axios from 'axios';
import { toggleLoader } from './GeneralActions';
import { queryDB } from '../services/Tracker';
import { onError } from '../services/ErrorService';
import { DBLocation } from '../types';

export const ShareUserLocations = (token: string) => async (dispatch: any, getState: any) => new Promise(async (resolve, reject) => {
  const { locale: { strings: { general: { error } } } } = getState();

  try {
    dispatch(toggleLoader(true));

    const locations: DBLocation[] = await queryDB();
    const dataRows = locations.map(location => ({ ...location, _long: location.long }));

    // TODO replace url once a valid one is available
    await axios.post('https://hamagenupload.azurewebsites.net/api/data/UploadMobileData', { token, dataRows });

    dispatch(toggleLoader(false));
    resolve();
  } catch (e) {
    const x = e;
    debugger;
    reject();
    onError({ error: e, showError: true, messageToShow: error });
  }
});
