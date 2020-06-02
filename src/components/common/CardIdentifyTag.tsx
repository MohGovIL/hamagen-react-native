import React, { FunctionComponent } from 'react';
import { View } from 'react-native';
import { Text } from '.';

interface Props {
    isRTL: boolean, 
    text: string,
    color: string
}

const CardIdentifyTag: FunctionComponent<Props> = ({ isRTL, text, color }) => (
  <View
    style={[{
      position: 'absolute',
      backgroundColor: color,
      paddingHorizontal: 11,
      paddingVertical: 5
    }, {
      [isRTL ? 'left' : 'right']: 0,
      [isRTL ? 'borderBottomRightRadius' : 'borderBottomLeftRadius']: 13
    }]}
  >
    <Text style={{ fontSize: 10 }}>{text}</Text>
  </View>
);

export default CardIdentifyTag; 
