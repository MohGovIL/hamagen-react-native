# Hamagen

Israel's Ministry of Health COVID-19 exposure prevention app.


## Hacking

You're awesome. See [CONTRIBUTING.md](CONTRIBUTING.md).

### Local Database Retrieval

Make sure your app is [`debuggable`](https://developer.android.com/guide/topics/manifest/application-element).

~~~
$ adb exec-out run-as com.hamagen.dev cat databases/Reactoffline.db > app_db.sqlite
~~~

## Debug & Release

Please make sure that you have the following environment variables set:

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
