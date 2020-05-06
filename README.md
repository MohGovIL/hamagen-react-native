# Hamagen
![Build](https://github.com/MohGovIL/hamagen-react-native/workflows/Build/badge.svg)
[![CodeCov](https://codecov.io/gh/MohGovIL/hamagen-react-native/branch/master/graph/badge.svg)](https://codecov.io/gh/MohGovIL/hamagen-react-native)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Israel's Ministry of Health's COVID-19 exposure prevention app.

## Roadmap
### Version 2.0
#### Improving exposure algorithm:
•	Adding user's duration time (t=15 minutes) at certain place <br>
•	Crossing via polygon <br>
•	Bluetooth <br>
•	Changing the Covid-19 patients history locations service from total to incremental <br>
#### New features:
•	Given user's consent, uploading epidemiologically significant locations of confirmed covid19 patients (in research on how to do it in a privacy preserving way) <br>
•	Telemetry, given user's consent <br>
•	Add ability to share the app [#61](https://github.com/MohGovIL/hamagen-react-native/pull/61) <br>
•	IOS: Access to phone  locations within the last 14 days by API (in research) <br>
#### User Experience:
•	Externalized the app's version number <br>
•	App is running <br>
•	Adding exposure location on map (point x, point y, radius or by polygon) <br>
•	Differentiation between users who press on "been there" to "not been there". Ability to delete the places the user declare "not been there". <br>
#### Tests:
•	Accessibility tests

### Version 3.0
•	Improving exposure algorithm - by WIFI <br>
•	Translation of covid-19 patient's location <br>
•	Adding manually history locations by the user <br>
•	Improving exposure algorithm - Public transport <br>
•	Delete user's history location from his phone after period of time (configurable)

## Hacking

You're awesome. See [CONTRIBUTING.md](CONTRIBUTING.md).

### Security Measures

Please review at:
https://medium.com/proferosec-osm/hamagen-application-fighiting-the-corona-virus-4ecf55eb4f7c

### Local Database Retrieval

Make sure your app is [`debuggable`](https://developer.android.com/guide/topics/manifest/application-element).

~~~
$ adb exec-out run-as com.hamagen.dev cat databases/Reactoffline.db > app_db.sqlite
~~~

## Debug & Release

Please make sure that you've created a keystore.properties file in your project's root dir with following variables set:

~~~
HAMAGEN_KEYSTORE_PATH = '../path/to/release.keystore'
HAMAGEN_STORE_PASSWORD= 'release store password'
HAMAGEN_KEY_ALIAS= 'release key alias'
HAMAGEN_KEY_PASSWORD= 'release key password'

HAMAGEN_DEBUG_KEYSTORE_PATH = '../path/to/debug.keystore'
HAMAGEN_DEBUG_STORE_PASSWORD= 'debug store password'
HAMAGEN_DEBUG_KEY_ALIAS= 'debug key alias'
HAMAGEN_DEBUG_KEY_PASSWORD= 'debug key password'

~~~

## License

MIT
