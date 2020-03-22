import React from 'react';
import { Image, ImageStyle } from 'react-native';

export interface IconProps {
  source: string | number,
  width?: number,
  height?: number,
  customStyles?: ImageStyle
}

const Icon = ({ source, height, width, customStyles }: IconProps) => {
  return (
    <Image
      source={typeof source === 'string' ? { uri: source, cache: 'force-cache' } : source}
      style={[{ width: width || height, height: height || width }, customStyles]}
      resizeMode="contain"
      resizeMethod="resize"
    />
  );
};

export { Icon };
