import moment from 'moment';
import _ from 'lodash';
import geoHash from 'latlon-geohash';
import { DOMParser } from 'xmldom';
import AsyncStorage from '@react-native-community/async-storage';
import { UserLocationsDatabase } from '../database/Database';
import { sha256 } from './sha256';
import { checkIfHideLocationHistory } from '../actions/GeneralActions';
import store from '../store';
import config from '../config/config';
import { UPDATE_FIRST_POINT } from '../constants/ActionTypes';
import { FIRST_POINT_TS, IS_LAST_POINT_FROM_TIMELINE, SHOULD_HIDE_LOCATION_HISTORY } from '../constants/Constants';

// tslint:disable-next-line:no-var-requires
const togeojson = require('./ToGeoJson.js');

export const getLoadingHTML = () => {
  return '<head>'
    + '<meta http-equiv="Content-Type" content="text/html; charset=UTF-8"/> '
    + '<style>html, body{height: 100%;}body{direction: rtl; margin: 0;}.container{height: 100%; padding: 0; margin: 0; display: -webkit-box; display: -moz-box; display: -ms-flexbox; display: -webkit-flex; display: flex; align-items: center; justify-content: center;}.row{width: auto;}svg{height: 300px; width: 300px;}.spinner{border-bottom-color: transparent; border-right-color: transparent; border-style: solid; border-radius: 50%; box-sizing: border-box; display: inline-block; vertical-align: middle; position: fixed; z-index: 1031; transform: translate(-50%, -50%); width: 5rem; height: 5rem; border-width: 10px; animation: spinner 1.5s linear infinite; border-top-color: #8cd6e3; border-left-color: #8cd6e3; margin-top: -20px;}/* Animation styles */ @keyframes spinner{0%{transform: rotate(0deg);}100%{transform: rotate(360deg);}}</style>'
    + '</head>'
    + '<body> '
    + '<div class="container"> '
    + '<span class="loader spinner spinner-large spinner-blue spinner-slow"></span> '
    + '<svg width="94px" height="122px" viewBox="0 0 94 122" version="1.1"> <title>Group 10</title> <desc>Created with Sketch.</desc> <g id="Page-1" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd" opacity="0.298921131"> <g id="No-Signal-Copy" transform="translate(-141.000000, -273.000000)"> <g id="Group-2" transform="translate(91.000000, 237.000000)"> <g id="Group-9" transform="translate(46.000000, 32.000000)"> <g id="Group-3" transform="translate(4.000000, 4.000000)"> <g id="Group-10"> <g id="Group-8"> <g id="Group-7"> <path d="M0,16.0453271 L0,59.8933024 C0,70.1297189 2.63369796,80.2266357 7.62503242,89.2175703 C12.6163669,98.2085048 19.9646208,105.67782 28.6989183,110.934454 L47,122 L47,0 L0,16.0453271 Z" id="Fill-5" fill="#D0D0D0"></path> <path d="M47,0 L47,122 L65.3003646,110.933804 C74.0353792,105.6772 81.3836331,98.0698609 86.3749676,89.2170471 C91.365585,80.3649488 94,70.1285923 94,59.8936666 L94,16.0452331 L47,0 Z" id="Fill-7" fill="#ABABAB"></path> </g> </g> </g> </g> </g> </g> </g> </g> </svg> '
    + '</div>'
    + '</body>';
};

export const getLastNrDaysKmlUrls = () => {
  const getKmlUrl = (day: number, month: number, year: number) => {
    return `https://www.google.com/maps/timeline/kml?authuser=0&pb=!1m8!1m3!1i${year}!2i${month}!3i${day}!2m3!1i${year}!2i${month}!3i${day}`;
  };

  return Array.from({ length: 14 }).map((_, index) => {
    const now = moment().subtract(index + 1, 'day');
    return getKmlUrl(now.date(), now.month(), now.year());
  });
};

const createObject = (point: any, timespan: any) => {
  return {
    startTime: moment(timespan.begin).valueOf(),
    endTime: moment(timespan.end).valueOf(),
    long: point[0],
    lat: point[1],
    geoHash: geoHash.encode(point[1], point[0]),
    accuracy: 0,
    wifiHash: ''
  };
};

export const kmlToGeoJson = (text: any) => {
  const kml = new DOMParser().parseFromString(text);
  const { features } = togeojson.kml(kml);

  const objArray: any[] = [];

  features.forEach((feature: any) => {
    if (!feature?.properties?.timespan || !feature?.geometry?.coordinates) {
      return;
    }

    if (!config().locationHistoryIgnoreList.includes(feature.properties.Category)) {
      if (feature.geometry.type === 'Point') {
        objArray.push(createObject(feature.geometry.coordinates, feature.properties.timespan));
      } else if (feature.geometry.type === 'LineString') {
        feature.geometry.coordinates.forEach((point: any) => {
          objArray.push(createObject(point, feature.properties.timespan));
        });
      }
    }
  });

  return objArray;
};

export const insertToSampleDB = (data : any[]) => new Promise(async (resolve, reject) => {
  try {
    if (data) {
      const db = new UserLocationsDatabase();
      let insertString = '';

      /**
       * !!!!!!!!!!!!
       * if the number of samples change in the database change also the algorithm in the insertBulkSamples method in database.js
       * !!!!!!!!!!!!
       */
      // format data for bulk insert
      data.forEach((currRow) => {
        insertString += `(${currRow.lat},${currRow.long},${currRow.accuracy},${currRow.startTime},${currRow.endTime},'${currRow.geoHash}','','${sha256(JSON.stringify(currRow))}'),`;
      });

      // remove last comma
      insertString = insertString.substring(0, insertString.length - 1);

      // insert bulk samples to db
      await db.insertBulkSamples(insertString);

      // insert first Point if needed
      data = _.sortBy(data, (point: any) => point.startTime);

      const firstPointTS = JSON.parse(await AsyncStorage.getItem(FIRST_POINT_TS) || 'false');

      if (!firstPointTS || (data[0].startTime < firstPointTS)) {
        await AsyncStorage.setItem(FIRST_POINT_TS, JSON.stringify(data[0].startTime));
        store().dispatch({ type: UPDATE_FIRST_POINT, payload: data[0].startTime });
      }

      // once 14 days flow completed for the first time
      await AsyncStorage.setItem(SHOULD_HIDE_LOCATION_HISTORY, 'true');
      store().dispatch(checkIfHideLocationHistory());

      // raise flag that last point in db is from timeline
      await AsyncStorage.setItem(IS_LAST_POINT_FROM_TIMELINE, 'true');

      resolve();
    }
  } catch (error) {
    reject(error);
  }
});
