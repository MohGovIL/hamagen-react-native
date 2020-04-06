import * as RNPermission from 'react-native-permissions/lib/typescript';
const { PERMISSIONS, RESULTS } = require('react-native-permissions/lib/commonjs/constants.js');

export { PERMISSIONS, RESULTS };
// mock out any functions you want in this style...
export async function check(permission: RNPermission.Permission) {
  jest.fn();
}

export async function request(permission: RNPermission.Permission) {
    return jest.fn().mockResolvedValue(true)
}