# Hamagen

Israel's Ministry of Health COVID-19 exposure prevention app.


## Hacking

You're awesome. See [CONTRIBUTING.md](https://gitlab.com/CodeAgainstCorona/hamagen/-/blob/master/CONTRIBUTING.md).

### Local Database Retrieval

Make sure your app is [`debuggable`](https://developer.android.com/guide/topics/manifest/application-element).

~~~
$ adb exec-out run-as com.hamagen.dev cat databases/Reactoffline.db > app_db.sqlite
~~~

## Release

Please make sure that you have the following environment variables set:

~~~
HAMAGEN_KEYSTORE_PATH = '../path/to/release.keystore'
HAMAGEN_STORE_PASSWORD= 'release store password'
HAMAGEN_KEY_ALIAS= 'release key alias'
HAMAGEN_KEY_PASSWORD= 'release key password'
~~~

## License

MIT
