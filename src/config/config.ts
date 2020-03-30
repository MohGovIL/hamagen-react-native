import DeviceInfo from 'react-native-device-info';
import axios, { AxiosResponse } from 'axios';
import { onError } from '../services/ErrorService';
import DefaultConfig from './default_config.json';
import { Config } from '../types';

// @ts-ignore
const env: 'com.hamagen.dev'|'com.hamagen.qa'|'com.hamagen' = DeviceInfo.getBundleId();

let config: Config = DefaultConfig[env];

export const initConfig = async () => new Promise(async (resolve) => {
  try {
    const res: AxiosResponse = await axios.get(`https://gisweb.azureedge.net/get_config.json?r=${Math.random()}`, { headers: { 'Content-Type': 'application/json;charset=utf-8' } });
    const { data } = await axios.get(`${res.data[env]}?r=${Math.random()}`, { headers: { 'Content-Type': 'application/json;charset=utf-8' } });

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
