import React, { FunctionComponent } from 'react';
import { View } from 'react-native';
import { Text } from '.';

interface Props {
    isRTL: boolean, 
    text: string,
    color: string,
    float?: boolean
}

const CardIdentifyTag: FunctionComponent<Props> = ({ isRTL, text, color, float = true }) => (
  <View
    style={[{
      backgroundColor: color,
      paddingHorizontal: 11,
      paddingVertical: 5
    }, {
      [isRTL ? 'borderBottomRightRadius' : 'borderBottomLeftRadius']: 13,
    }, float && {
      position: 'absolute',
      [isRTL ? 'left' : 'right']: 0,
    }]}
  >
    <Text style={{ fontSize: 10 }}>{text}</Text>
  </View>
);

export default CardIdentifyTag; 
