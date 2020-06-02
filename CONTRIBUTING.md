# Contributing

Thanks for considering contributing to Hamagen - Israel's Ministry of Health's COVID-19 exposure prevention app!

## Opening issues

If you find a bug, please feel free to [open an issue](https://github.com/MohGovIL/hamagen-react-native/issues).

If you are taking the time to mention a problem, even a seemingly minor one, it is greatly appreciated, and a totally valid contribution to this project. Thank you!


## Adding new features

Thinking of adding a new feature? Cool! [Open an issue](https://github.com/MohGovIL/hamagen-react-native/issues) and let’s design it together.

## Fixing bugs

We love pull requests. Here’s a quick guide:

1. [Fork this repository](https://github.com/MohGovIL/hamagen-react-native/) and then clone it locally:

  ```bash
  git clone https://github.com/<yourUserName>/hamagen-react-native/
  ```

2. Create a topic branch for your changes:

  ```bash
  git checkout -b fix-for-that-thing
  ```
3. Commit a failing test for the bug:

  ```bash
  git commit -am "Adds a failing test to demonstrate that thing"
  ```

4. Commit a fix that makes the test pass:

  ```bash
  git commit -am "Adds a fix for that thing!"
  ```

5. Run the tests:

  ```bash
  npm test
  ```

6. If everything looks good, push to your fork:

  ```bash
  git push origin fix-for-that-thing
  ```

7. Submit a pull request.

## Local Database Retrieval
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
