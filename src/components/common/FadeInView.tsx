import React, { ReactNode } from 'react';
import { ViewProps } from 'react-native';
import * as Animatable from 'react-native-animatable';

interface Props extends Animatable.AnimatableProperties<{}>, ViewProps {
  children: ReactNode,
  keyString?: string,
  animation?: string
}

const FadeInView = (props: Props) => {
  const { children, keyString = 'key', animation = 'fadeIn' } = props;

  return (
    <Animatable.View {...props} key={keyString} animation={animation} duration={400} useNativeDriver>
      { children }
    </Animatable.View>
  );
};

export { FadeInView };
