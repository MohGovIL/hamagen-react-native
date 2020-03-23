import React, { useState } from 'react';
import { StyleSheet, Text, View, Button } from 'react-native';
import { connect } from 'react-redux';
// yarn add xmldom
import { DOMParser } from 'xmldom';
import { WebView } from 'react-native-webview';
// added the libraries because the insert happen here!
import geoHash from 'latlon-geohash';
// added to Database.js new function - insertBuldSamples 
import { UserLocationsDatabase } from '../database/Database';
import { sha256 } from '../services/sha256';
// create file named togeojson.js in components, put it in the write place
const togeojson = require('./togeojson');


const getKmlUrl = (date) => {
  const year = date.getFullYear();
  const month = date.getMonth(); // starts from 0
  const mday = date.getDate();
  const downloadUrl = `https://www.google.com/maps/timeline/kml?authuser=0&pb=!1m8!1m3!1i${
    year
  }!2i${
    month
  }!3i${
    mday
  }!2m3!1i${
    year
  }!2i${
    month
  }!3i${
    mday}`;
  return downloadUrl;
};

// Period = number of days in seconds
/*
<option id="HTML_LAST_31_DAYS" value="-2678400">last 31 days</option>
<option id="HTML_LAST_14_DAYS" value="-1209600" selected>last 14 days</option>
<option id="HTML_LAST_7_DAYS" value="-604800">last 3 days</option>
<option id="HTML_LAST_3_DAYS" value="-259200">last 3 days</option>
<option id="HTML_ONLY_TODAY" value="-0">Today</option>
*/

const NR_HISTORY_DAYS = {
  1: '-0',
  3: '-259200',
  7: '-604800',
  14: '-1209600',
  31: '-2678400',
};

const getLastNrDaysKmlUrls = (nrDays) => {
  const period = NR_HISTORY_DAYS[nrDays];

  let begin; let 
    end;

  if (period.startsWith('-')) {
    // last N seconds
    const now = new Date() / 1000; // get curent timestamp
    begin = now - parseInt(period.substr(1));
    end = now;
  } else {
    // period seperated by comma
    [begin, end] = period.split(',');
    [begin, end] = [parseInt(begin), parseInt(end)];
  }

  const secs_per_day = 24 * 60 * 60;
  const kmlUrls = [];
  for (let timestamp = begin; timestamp <= end; timestamp += secs_per_day) {
    const date = new Date(timestamp * 1000);
    kmlUrls.push(getKmlUrl(date));
  }

  return kmlUrls;
};

const injectedJavaScript = `(function() {
    window.ReactNativeWebView.postMessage("BEFORE IF");
    if(window.location.href.startsWith('https://myaccount.google.com/?utm_source=sign_in_no_continue')) {
        window.ReactNativeWebView.postMessage("LOGGED_IN");
    }
})();`;

const html = `
  <html>
    <body>
      Fetching location data of the last 14 days...
    </body>
  </html>
`;

export const flow = () => {
  let webViewRef = null;
  return (
    <WebView
      originWhitelist={['*']}
      ref={WEBVIEW_REF => (webViewRef = WEBVIEW_REF)}
      onMessage={async (event) => {
        const { data } = event.nativeEvent;
        console.log(data);
        if (!data) return;

        if (data === 'LOGGED_IN') {
          webViewRef.injectJavaScript(`
          document.getElementsByTagName('html')[0].innerHTML = 'Fetching location data of the last 14 days...'
          `);

          const kmlUrls = getLastNrDaysKmlUrls(14);
          // console.log(kmlUrls);
          const responses = await Promise.all(kmlUrls.map(url => fetch(url)));
          const texts = await Promise.all(responses.map(r => r.text()));
          // only for test
          // kmlToGeoJson(texts[8]);
          // for production
          for (const text of texts) {
            kmlToGeoJson(text);
          }

          webViewRef.injectJavaScript(`
          document.getElementsByTagName('html')[0].innerHTML = 'Done!'
          `);
        }
      }}
      injectedJavaScript={injectedJavaScript}
      source={{
        uri:
          'https://accounts.google.com/signin/v2/identifier?service=accountsettings&flowName=GlifWebSignIn&flowEntry=ServiceLogin',
      }}
      style={{ marginTop: 25 }}
    />
  );
};

// parse kml to geoJson and build sample object!
const kmlToGeoJson = async (text: any) => {
  const kml = new DOMParser().parseFromString(text);
  const converted = togeojson.kml(kml);
  const { features } = converted;
  const objArray = [];
  for (const feature of features) {
    if (feature.properties.Category != 'Driving') {
      if (feature.geometry.type == 'Point') {
        const obj = {
          accuracy: 0,
          wifiHash: ''
        };
        setLocation(obj, feature.geometry.coordinates);
        setTime(obj, feature.properties.timespan);
        objArray.push(obj);
      } else if (feature.geometry.type == 'LineString') {
        for (const point of feature.geometry.coordinates) {
          const obj = {
            accuracy: 0,
            wifiHash: ''
          };
          setLocation(obj, point);
          setTime(obj, feature.properties.timespan);
          objArray.push(obj);
        }
      }
    }
  }
  insertToSampleDB(objArray);
};

// Bulk insert data into SQLite DB
const insertToSampleDB = async (data : any[]) => {
  if (data) {
    const db = new UserLocationsDatabase();
    let insertString = '';
    // format data for bulk insert
    for (const currRow of data) {
      insertString += `(${currRow.lat},${currRow.long},${currRow.accuracy},${currRow.startTime},${currRow.endTime},'${currRow.geoHash}', '', '${sha256(JSON.stringify(currRow))}'),`;
    }
    // remove last comma
    insertString = insertString.substring(0, insertString.length - 1);
    // insert bulk samples to db
    await db.insertBuldSamples(insertString);
    // check that the data was inserted
    const rows = await db.listSamples();
    console.log(`dbData:${JSON.stringify(rows)}`);
  }
};

const setTime = (obj, timespan) => {
  if (timespan) {
    if (timespan.begin && timespan.end) {
      const startTime = new Date(timespan.begin).getTime();
      const endTime = new Date(timespan.end).getTime();
      obj.startTime = startTime;
      obj.endTime = endTime;
    }
  }
};

const setLocation = (obj, coordinates) => {
  if (coordinates) {
    obj.long = coordinates[0];
    obj.lat = coordinates[1];
    obj.geoHash = geoHash.encode(obj.lat, obj.long);
  }
};

const GoogleTimeLine = () => {
  const [openWebview, setOpenWebview] = useState(false);
  console.log('RENDER APP ');

  if (openWebview) {
    return flow();
  }

  return (
    <View>
      <Text> Test - Google Timeline</Text>
      <Button title="Open" onPress={() => setOpenWebview(true)} />
    </View>
  );
};

export default connect(null, null)(GoogleTimeLine);
