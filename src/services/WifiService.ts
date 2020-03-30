import WifiManager from 'react-native-wifi-reborn';
import { NetworkInfo } from 'react-native-network-info';
// @ts-ignore
import { sha1 } from 'react-native-sha1';
import { IS_IOS } from '../constants/Constants';


export const getWifiList = () => new Promise(async (resolve, reject) => {
  try {
    let bssids;
    let bssidsToConvert = '';
    let hexBssidsString;
    if (IS_IOS) {
      bssids = await NetworkInfo.getBSSID();

      if (bssids) {
        hexBssidsString = await sha1(bssids);
        resolve({ wifiHash: hexBssidsString, wifiList: bssids });
      }

      resolve({ wifiHash: '', wifiList: '' });
    } else {
      WifiManager.loadWifiList(async (wifiObjects) => {
        bssids = orderListOfMacAddresses(JSON.parse(wifiObjects));
        for (let i = 0; i < bssids.length; i++) {
          bssidsToConvert = bssidsToConvert.concat(i !== 0 ? ',' : '', bssids[i].BSSID.replace(/:/g, ''));
        }
        hexBssidsString = await sha1(bssidsToConvert);
        resolve({ wifiHash: hexBssidsString, wifiList: bssidsToConvert });
      }, (e) => {
        console.log('Cannot get current SSID!', e);
        reject(e);
      });
    }
  } catch (e) {
    console.log('Cannot get current SSID!', e);
    reject(e);
  }
});

const orderListOfMacAddresses = (list: any) => {
  return list.sort((a: any, b: any) => a.BSSID.localeCompare(b.BSSID));
};
