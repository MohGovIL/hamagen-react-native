import DeviceInfo from 'react-native-device-info';
import { downloadAndVerifySigning } from '../services/SigningService';
import { onError } from '../services/ErrorService';
import DefaultConfig from './default_config.json';
import { Config } from '../types';

// @ts-ignore
export const env: 'com.hamagen.qa'|'com.hamagen' = DeviceInfo.getBundleId();

let config: Config = DefaultConfig[env] || DefaultConfig['com.hamagen.qa'];

export const initConfig = async () => new Promise(async (resolve) => {
  try {
    const configUrls = await downloadAndVerifySigning('https://gisweb.azureedge.net/get_config.json');
    const data = await downloadAndVerifySigning(configUrls[env]);

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
