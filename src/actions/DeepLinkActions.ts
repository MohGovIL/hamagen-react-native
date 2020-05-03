import axios from 'axios';
import { toggleLoader } from './GeneralActions';
import { getUserLocationsReadyForServer } from '../services/DeepLinkService';
import { onError } from '../services/ErrorService';
import config from '../config/config';

export const shareUserLocations = (token: string) => async (dispatch: any) => new Promise(async (resolve, reject) => {
  try {
    dispatch(toggleLoader(true));

    // TODO check if should resolve res.data and not res.
    const res = await axios.post(config().dataShareUrl, await getUserLocationsReadyForServer(token));

    dispatch(toggleLoader(false));

    resolve(res);
  } catch (error) {
    reject();
    onError({ error });
  }
});
