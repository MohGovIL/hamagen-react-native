import seedrandom from 'seedrandom';
import { minute, loc1, loc2, loc3, loc4 } from './constForTesting';
import { exampleGeoHash, geoHashWithBoundBox, geoHashClustering, mergeGeoCode, mergeGeoCodeWithThreshold, geoHashClusteringWithTimeInterval } from './GeoCodingMap';

// tslint:disable-next-line:no-var-requires
const { randomCirclePoint, randomCircumferencePoint } = require('random-location');

describe('testing of GeoHash functions', () => {
  test('tesing the basic geohash on a known hash location', () => {
    // TO DO: change the error string check from exact to regular expression
    expect(exampleGeoHash(52.2, 0.12)).toEqual('u120fw');
  });
  test('check the hashing of the location points', () => {
    const locs = [loc1, loc2, loc3, loc4];
    const hashes = locs.map(elem => geoHashWithBoundBox(elem));
    console.log(hashes);
    expect(hashes.length === locs.length);
  });
  test('check the merging of a known locations', () => {
    const maploc1 = geoHashWithBoundBox(loc1);
    const loc1Close = {
      startTime: loc1.endTime,
      endTime: loc1.endTime + 40 * 60 * 1000,
      accuracy: 10,
      long: loc1.long + 0.0002,
      lat: loc1.lat + 0.0002,
      geoHash: '',
      wifiHash: '',
      hash: ''
    };
    const maploc1Close = geoHashWithBoundBox(loc1Close);
    const merge = mergeGeoCode(maploc1, maploc1Close);
    console.log(merge);
    expect(merge?.locIndex).toEqual(maploc1.locIndex);
    expect(merge?.timeInter.length).toEqual(4);
    expect(merge?.bound.length).toEqual(4);
  });
  test('check the merging of a known locations consecutive times', () => {
    // using loc3 as loc1 interval is greater than threshold thus not unifiable
    const maploc3 = geoHashWithBoundBox(loc3);
    const loc3CloseConsecTime = {
      startTime: loc3.endTime,
      endTime: loc3.endTime + 10 * 60 * 1000,
      accuracy: 10,
      long: loc3.long + 0.0002,
      lat: loc3.lat + 0.0002,
      geoHash: '',
      wifiHash: '',
      hash: ''
    };
    const maploc3Close = geoHashWithBoundBox(loc3CloseConsecTime);
    const merge = mergeGeoCodeWithThreshold(maploc3, maploc3Close, 60 * 60 * 1000);
    console.log('MERGE : 1=', maploc3, ', 2-', maploc3Close, ' =merge= ', merge);
    expect(merge?.locIndex).toEqual(maploc3.locIndex);
    expect(merge?.timeInter.length).toEqual(2);
    expect(merge?.bound.length).toEqual(2);
  });

  test('check the merging of a known locations non consecutive times', () => {
    const maploc1 = geoHashWithBoundBox(loc1);
    const loc1CloseNonconsecTime = {
      startTime: loc1.endTime + 1 * 60 * 1000,
      endTime: loc1.endTime + 40 * 60 * 1000,
      accuracy: 10,
      long: loc1.long + 0.0002,
      lat: loc1.lat + 0.0002,
      geoHash: '',
      wifiHash: '',
      hash: ''
    };
    const maploc1Close = geoHashWithBoundBox(loc1CloseNonconsecTime);
    const merge = mergeGeoCodeWithThreshold(maploc1, maploc1Close, 60 * 60 * 1000);
    console.log(merge);
    expect(merge?.locIndex).toEqual(maploc1.locIndex);
    expect(merge?.timeInter.length).toEqual(4);
    expect(merge?.bound.length).toEqual(4);
  });
});

describe('random generation of points', () => {
  const seed = 'this is a seed';
  const randomFn = seedrandom(seed);
  const timediff = randomFn();
  test('inside the circle we get always the same list from function', () => {
    // Eiffel Tower
    const P1 = {
      latitude: 48.8583736,
      longitude: 2.2922926,
    };
    const P1Location = {
      startTime: Date.now(),
      endTime: Math.floor(Date.now() + timediff * minute),
      accuracy: 10,
      long: P1.longitude,
      lat: P1.latitude,
      geoHash: '',
      wifiHash: '',
      hash: ''
    };

    const hashP1 = geoHashWithBoundBox(P1Location);
    const R = 150; // meters
    let currStartTime = P1Location.endTime;
    for (let i = 0; i < 20; i++) {
      const randomPoint = randomCirclePoint(P1, R);
      const randomLocation = {
        startTime: currStartTime,
        endTime: Math.floor(currStartTime + timediff * minute),
        accuracy: 10,
        long: randomPoint.longitude,
        lat: randomPoint.latitude,
        geoHash: '',
        wifiHash: '',
        hash: ''
      };
      currStartTime = randomLocation.endTime;
      expect(geoHashWithBoundBox(randomLocation).locIndex).toEqual(hashP1.locIndex);
    }
  });
  test('on a circle circumfance bigger than radius of hash accuracy we get different hashing', () => {
    // Eiffel Tower
    const P1 = {
      latitude: 48.8583736,
      longitude: 2.2922926,
    };
    const P1Location = {
      startTime: Date.now(),
      endTime: Math.floor(Date.now() + timediff * minute),
      accuracy: 10,
      long: P1.longitude,
      lat: P1.latitude,
      geoHash: '',
      wifiHash: '',
      hash: ''
    };

    const hashP1 = geoHashWithBoundBox(P1Location);
    const R = 1000; // meters
    let currStartTime = P1Location.endTime;
    for (let i = 0; i < 20; i++) {
      const randomPoint = randomCircumferencePoint(P1, R);
      const randomLocation = {
        startTime: currStartTime,
        endTime: currStartTime + timediff * minute,
        accuracy: 10,
        long: randomPoint.longitude,
        lat: randomPoint.latitude,
        geoHash: '',
        wifiHash: '',
        hash: ''
      };
      currStartTime = randomLocation.endTime;
      // const reason = (i % 2 === 0) ? 'box_hash' : 'exact_hash';
      // expect written wrong
      expect(geoHashWithBoundBox(randomLocation).locIndex).not.toEqual(hashP1.locIndex);
    }
  });
  test('on a circle circumfance in changing radius we get clustering', () => {
    // Eiffel Tower
    const P1 = {
      latitude: 48.8583736,
      longitude: 2.2922926,
    };
    const P1Location = {
      startTime: Date.now(),
      endTime: Math.floor(Date.now() + timediff * minute),
      accuracy: 10,
      long: P1.longitude,
      lat: P1.latitude,
      geoHash: '',
      wifiHash: '',
      hash: ''
    };
    let R = 100; // meters
    let currStartTime = P1Location.endTime;
    const locs = [P1Location];
    for (let i = 0; i < 20; i++) {
      const randomPoint = randomCircumferencePoint(P1, R);
      const randomLocation = {
        startTime: currStartTime,
        endTime: Math.floor(currStartTime + timediff * minute),
        accuracy: 10,
        long: randomPoint.longitude,
        lat: randomPoint.latitude,
        geoHash: '',
        wifiHash: '',
        hash: ''
      };
      locs.push(randomLocation);
      currStartTime = randomLocation.endTime;
      R += 10;
    }
    const mapG = locs.map(t => geoHashWithBoundBox(t));
    console.log('mapG: ', mapG);

    const mapGCluster = geoHashClustering(mapG);
    console.log('cluster 1:', mapGCluster);

    const mapGCluster2 = geoHashClusteringWithTimeInterval(mapG, 60 * 60 * 1000);
    console.log('cluster 2:', mapGCluster2);

    expect(Object.keys(mapGCluster).length).toBeGreaterThanOrEqual(1);
    expect(Object.keys(mapGCluster).length).toBeLessThanOrEqual(2);
    expect(Object.keys(mapGCluster2).length).toBeGreaterThanOrEqual(1);
    expect(Object.values(mapGCluster2)[0].timeInter.length).toBeLessThanOrEqual(Object.values(mapGCluster)[0].timeInter.length);
    expect(Object.keys(mapGCluster2).length).toBeLessThanOrEqual(2);
  });
});
