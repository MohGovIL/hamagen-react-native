import axios from 'axios';
import DeviceInfo from 'react-native-device-info';
import { downloadAndVerifySigning } from '../services/SigningService';
import { onError } from '../services/ErrorService';
import DefaultConfig from './default_config.json';
import { Config } from '../types';

// @ts-ignore
const env: 'com.hamagen.qa'|'com.hamagen' = DeviceInfo.getBundleId();
// @ts-ignore
let config: Config = DefaultConfig[env] || DefaultConfig['com.hamagen.qa'];

export const initConfig = async () => new Promise(async (resolve) => {
  try {
    const configUrls = await axios.get(`https://gisweb.azureedge.net/get_config.json?r=${Math.random()}`, { headers: { 'Content-Type': 'application/json;charset=utf-8' } });
    const data = await downloadAndVerifySigning(configUrls.data[env]);

    config = data[env];
    resolve();
  } catch (error) {
    onError({ error });
    resolve();
  }
});

export default function () {
  return config;
}
