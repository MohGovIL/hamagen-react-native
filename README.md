# Hamagen
![Build](https://github.com/MohGovIL/hamagen-react-native/workflows/Build/badge.svg)
[![CodeCov](https://codecov.io/gh/MohGovIL/hamagen-react-native/branch/master/graph/badge.svg)](https://codecov.io/gh/MohGovIL/hamagen-react-native)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Israel's Ministry of Health's COVID-19 exposure prevention app.

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
