import React, { FunctionComponent } from 'react';
import { View } from 'react-native';
import { Text } from '.';
import * as LocalizedStyles from '../../constants/LocalizedStyles'

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
      [LocalizedStyles.borderBottomSideRadius(isRTL)]: 13,
    }, float && {
      position: 'absolute',
      [LocalizedStyles.side(isRTL, true)]: 0,
    }]}
  >
    <Text style={{ fontSize: 10 }}>{text}</Text>
  </View>
);

export default CardIdentifyTag; 
