import axios from 'axios';
import { StackNavigationProp } from '@react-navigation/stack';
import { toggleLoader } from './GeneralActions';
import { queryDB } from '../services/Tracker';
import { onError } from '../services/ErrorService';
import { DBLocation } from '../types';

export const ShareUserLocations = (token: string, navigation: StackNavigationProp<any>) => async (dispatch: any) => {
  try {
    dispatch(toggleLoader(true));

    const locations: DBLocation[] = await queryDB();
    const dataRows = locations.map(location => ({ ...location, _long: location.long }));

    // TODO add header once available and move URL to config
    await axios.post('https://hamagenupload.azurewebsites.net/api/data/UploadMobileData', { token, dataRows }, { headers: { } });

    dispatch(toggleLoader(false));
    navigation.pop();
  } catch (error) {
    onError({ error });
  }
};
