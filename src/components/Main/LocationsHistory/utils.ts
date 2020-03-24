import moment from 'moment';
import geoHash from 'latlon-geohash';
import { DOMParser } from 'xmldom';
import { UserLocationsDatabase } from '../../../database/Database';
import { sha256 } from '../../../services/sha256';

// tslint:disable-next-line:no-var-requires
const togeojson = require('./ToGeoJson.js');

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

export const kmlToGeoJson = async (text: any) => {
  const kml = new DOMParser().parseFromString(text);
  const { features } = togeojson.kml(kml);

  const objArray: any[] = [];

  features.forEach((feature: any) => {
    if (!feature?.properties?.timespan || !feature?.geometry?.coordinates) {
      return;
    }

    if (feature.properties.Category !== 'Driving') {
      if (feature.geometry.type === 'Point') {
        objArray.push(createObject(feature.geometry.coordinates, feature.properties.timespan));
      } else if (feature.geometry.type === 'LineString') {
        feature.geometry.coordinates.forEach((point: any) => {
          objArray.push(createObject(point, feature.properties.timespan));
        });
      }
    }
  });

  await insertToSampleDB(objArray);
};

export const insertToSampleDB = async (data : any[]) => {
  if (data) {
    const db = new UserLocationsDatabase();
    let insertString = '';

    // format data for bulk insert
    data.forEach((currRow) => { insertString += `(${currRow.lat},${currRow.long},${currRow.accuracy},${currRow.startTime},${currRow.endTime},'${currRow.geoHash}', '', '${sha256(JSON.stringify(currRow))}'),`; });

    // remove last comma
    insertString = insertString.substring(0, insertString.length - 1);

    // insert bulk samples to db
    await db.insertBulkSamples(insertString);
  }
};
