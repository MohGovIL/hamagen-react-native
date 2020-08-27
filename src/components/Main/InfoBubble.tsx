import React, { FunctionComponent } from 'react';
import { StyleSheet, View } from 'react-native';
import { MAIN_COLOR, SCREEN_WIDTH } from '../../constants/Constants';
import { Icon, Text, TouchableOpacity } from '../common';

interface Props {
  isRTL: boolean
  info: string
  moreInfo: string
  title?: string
  onPress(): void
}

const InfoBubble: FunctionComponent<Props> = ({ isRTL, info, moreInfo, title, onPress }) => {
  return (
    <TouchableOpacity onPress={onPress}>
      <View style={[styles.container, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
        <Icon source={require('../../assets/locationHistory/info.png')} width={18} customStyles={{marginTop: 18}}/>
        <View style={[styles.textContainer, { alignItems: isRTL ? 'flex-end' : 'flex-start' }]}>
          {title && <Text
            style={[{ color: 'rgb(34,34,34)', fontSize: 13, }, { textAlign: isRTL ? 'right' : 'left' }]}
          >{title}</Text>}
          <Text style={[styles.text, { textAlign: isRTL ? 'right' : 'left' }]}>{info}</Text>
          <View style={{ borderBottomWidth: 1, borderBottomColor: MAIN_COLOR }}>
            <Text style={[styles.text, { textAlign: isRTL ? 'right' : 'left' }]} bold>{moreInfo}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: SCREEN_WIDTH - 36,
    // alignItems: 'center',
    paddingHorizontal: 10,
    borderRadius: 14,
    backgroundColor: 'rgb(242,250,253)',
    marginBottom: 8
  },
  textContainer: {
    flex: 1,
    paddingVertical: 15,
    paddingHorizontal: 5,
  },
  text: {
    color: 'rgb(106,106,106)',
    fontSize: 13,
  }
});

export default React.memo(InfoBubble); 
