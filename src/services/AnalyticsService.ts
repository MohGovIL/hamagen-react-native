import firebase from 'react-native-firebase';

export const logEvent = (name: string, params: any) => {
  firebase.analytics().logEvent(name, params);
};
