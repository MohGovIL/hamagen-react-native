import DeviceInfo from 'react-native-device-info';
import axios from 'axios';
import { onError } from '../services/ErrorService';
import DefaultConfig from './DefaultConfig.json';
import { Config } from '../types';

const env: 'com.hamagen.dev'|'com.hamagen.qa'|'com.hamagen' = DeviceInfo.getBundleId();

let config: Config = DefaultConfig[env];

export const initConfig = async () => new Promise(async (resolve) => {
  try {
    const { data } = await axios.get(`https://matrixdemos.blob.core.windows.net/mabar/config.json?r=${Math.random()}`, { headers: { 'Content-Type': 'application/json;charset=utf-8' } });

    config = data[env];
    resolve();
  } catch (error) {
    resolve();
    onError({ error });
  }
});

export default function () {
  return config;
}
