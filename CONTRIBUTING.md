# Contributing

Thanks for considering contributing to Hamagen - Israel's Ministry of Health's COVID-19 exposure prevention app!

## Getting Started

1. Make sure you have NodeJS >12 installed locally (https://nodejs.org/en/)
2. Install latest version of Yarn (https://classic.yarnpkg.com/en/docs/install/#mac-stable)
3. Clone this repo (or, your fork)
4. Install dependencies by running `yarn` in the root directory.

## Running locally for iOS

If you wish to run the iOS project locally, you need to make sure to have the following:

1. Make sure you have XCode installed and it's utils. Also make sure you have iOS Simulator configured correctly.
2. Install CocoaPods dependencies by doing: `cd ios && pod install`
3. Run `yarn ios` from the root directory - this should build the project and start the iOS Simulator.

## Running locally for Android

TODO

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
