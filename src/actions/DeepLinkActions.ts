import axios from 'axios';
import { toggleLoader } from './GeneralActions';
import { getUserLocationsReadyForServer } from '../services/DeepLinkService';
import { onError } from '../services/ErrorService';
import config from '../config/config';

export const shareUserLocations = (token: string, userAgreedToBle: boolean) => async (dispatch: any) => new Promise(async (resolve, reject) => {
  try {
    dispatch(toggleLoader(true));

    const { data } = await axios.post(config().dataShareUrl, await getUserLocationsReadyForServer(token, userAgreedToBle));
    dispatch(toggleLoader(false));

    resolve(data);
  } catch (error) {
    reject();
    onError({ error });
  }
});
