import { StackNavigationProp } from '@react-navigation/stack';

export const onOpenedFromDeepLink = (url: string, navigation: StackNavigationProp<any>) => {
  const { token } = parseQueryParamsFromUrlScheme(url);

  if (token) {
    return navigation.navigate('ShareLocations', { token });
  }
};

const parseQueryParamsFromUrlScheme = (url: string): any => {
  const obj: any = {};

  if (!url || url.indexOf('?') === -1) {
    return {};
  }

  const queryParams = url.slice(url.indexOf('?') + 1).split('&');

  // Loop through each key/value pair
  queryParams.forEach((part) => {
    // Split each key/value pair into their separate parts
    const pair = part.split('=');
    const key = pair[0];
    const value = pair[1];

    // If the key doesn't exist yet, set it
    if (!obj[key]) {
      obj[key] = value;
    } else {
      // If it's not an array, make it an array
      if (!Array.isArray(obj[key])) {
        obj[key] = [obj[key]];
      }

      // Push the new value to the key's array
      obj[key].push(value);
    }
  });

  return obj;
};
