import {SCREEN_WIDTH} from '../constants/Constants';

export const marginSide = (isRTL: boolean, reverse?: boolean) => {
  return isRTL && !reverse ? 'marginRight' : 'marginLeft';
};

export const side = (isRTL: boolean, reverse?: boolean) => {
  return isRTL && !reverse ? 'right' : 'left';
};

export const flexDirection = (isRTL: boolean, reverse?: boolean) => {
  return isRTL && !reverse ? 'row-reverse' : 'row';
};

export const borderBottomSideRadius = (isRTL: boolean) => {
  return isRTL ? 'borderBottomRightRadius' : 'borderBottomLeftRadius';
};

export const rotateDegree = (isRTL: boolean, reverse?: boolean) => {
  return isRTL && !reverse ? '180deg' : '0deg';
};

export const alignSelf = (isRTL: boolean) => {
  return isRTL ? 'flex-end' : 'flex-start';
};

export const alignItems = (isRTL: boolean) => {
  return isRTL ? 'flex-end' : 'flex-start';
};

export const paddingSide = (isRTL: boolean) => {
  return isRTL ? 'paddingLeft' : 'paddingRight';
};

export const leading = (isRTL: boolean) => {
  return isRTL ? SCREEN_WIDTH : 0;
};

export const translateAnim = (isRTL: boolean) => {
  return isRTL ? -1 : 1;
};
