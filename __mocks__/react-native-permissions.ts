import { Permission } from 'react-native-permissions';

export const PERMISSIONS = {
  IOS: {
    LOCATION_ALWAYS: 'LOCATION_ALWAYS'
  }
};

export const RESULTS = {
  GRANTED: 'GRANTED'
};

// mock out any functions you want in this style...
export const check = async (permission: Permission) => {
  return jest.fn().mockResolvedValue(true);
};

export const request = async (permission: Permission) => {
  return jest.fn().mockResolvedValue(true);
};
