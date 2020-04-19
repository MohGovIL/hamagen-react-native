import Geohash from 'latlon-geohash';
import { assignWith } from 'lodash';
import { DBLocation } from '../../types';

// improve boxing interface
export interface GeoCode {
  locIndex: string;
  timeInter: number [];
  bound: Array<{latitude: number, longitude: number}>;
}

export const exampleGeoHash = (lat: number, lon: number) => {
  // trying diffrent functions of the package and returning the
  // encode of the input
  const geoHash = Geohash.encode(lat, lon, 6);
  const location = Geohash.decode(geoHash);
  console.log(location, ' should be same as (', lat, ',', lon, ')');

  const NWSE = Geohash.bounds(geoHash);
  console.log('bounds of ', location, ' is ', NWSE);

  return geoHash;
};

// to do make string into enum
export const geoHashWithBoundBox = (loc: DBLocation, defPrecision = 6): GeoCode => {
  const geoHash = Geohash.encode(loc.lat, loc.long, defPrecision);
  const box = Geohash.bounds(geoHash);

  return {
    locIndex: geoHash,
    timeInter: [loc.startTime, loc.endTime],
    bound: [
      { latitude: box.ne.lat, longitude: box.ne.lon },
      { latitude: box.sw.lon, longitude: box.sw.lon }
    ]
  };
};

export const mergeGeoCode = (g1: GeoCode | undefined, g2: GeoCode) => {
  if (g1 === undefined) { return undefined; }

  console.assert(g1.locIndex === g2.locIndex);

  return {
    locIndex: g1.locIndex,
    timeInter: g1.timeInter.concat(g2.timeInter),
    bound: g1.bound.concat(g2.bound)
  };
};


export const timeUnite = (T1: number[], T2: number[]): [number, number[]] => {
  const unite = [Math.min(T1[0], T2[0]), Math.max(T1[1], T2[1])];
  return [unite[1] - unite[0], unite];
};


export const mergeGeoCodeWithThreshold = (g1: GeoCode | undefined, g2: GeoCode, timeThreshold: number) => {
  if (g1 === undefined) { return undefined; }

  console.assert(g1.locIndex === g2.locIndex);

  if (g1.timeInter[g1.timeInter.length - 1] === g2.timeInter[0]) {
    const pot = timeUnite(g1.timeInter.slice(g1.timeInter.length - 2), g2.timeInter);

    console.log('DEBUG: intersect of g1 ', g1.timeInter.slice(g1.timeInter.length - 2), ' g2 ', g2.timeInter, ' = ', pot, ' update ', pot[0] < timeThreshold);

    if (pot[0] < timeThreshold) {
      g1.timeInter[g1.timeInter.length - 1] = pot[1][1];
      g2.timeInter = [];
      g2.bound = [];
      console.log('DEBUG(g1,g2):', g1, ',', g2);
    }

    console.log('DEBUG2(g1,g2):', g1, ',', g2);
  }

  return {
    locIndex: g1.locIndex,
    timeInter: g1.timeInter.concat(g2.timeInter),
    bound: g1.bound.concat(g2.bound)
  };
};

export const geoHashClustering = (locs: GeoCode[]): Record<string /* locindex */, GeoCode> => {
  if (locs.length === 0) { return {}; }

  const concatByLocIndex = (listOfObjects: Array<Record<string, GeoCode>>) => {
    return assignWith<Record<string, GeoCode>>({}, ...listOfObjects, (x: GeoCode | undefined, y: GeoCode) => x ? mergeGeoCode(x, y) : x);
  };


  return concatByLocIndex(locs.map(geoCode => ({ [geoCode.locIndex]: geoCode }))); // geoMap
};

export const geoHashClusteringWithTimeInterval = (locs: GeoCode[], timeThreshold: number) : Record<string/* locindex */, GeoCode> => {
  if (locs.length === 0) { return {}; }

  const concatByLocIndex = (listOfObjects: Array<Record<string, GeoCode>>) => {
    return assignWith<Record<string, GeoCode>>({}, ...listOfObjects, (x: GeoCode | undefined, y: GeoCode) => x ? mergeGeoCodeWithThreshold(x, y, timeThreshold) : x);
  };

  return concatByLocIndex(locs.map(geoCode => ({ [geoCode.locIndex]: geoCode }))); // geoMap
};
