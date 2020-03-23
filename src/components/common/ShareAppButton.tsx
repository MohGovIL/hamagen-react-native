import React, { ElementType } from 'react';
import { StyleSheet, View } from 'react-native';
import { Icon, TouchableOpacity } from '.';
import { toggleChangeLanguage } from '../../actions/LocaleActions';


const ShareAppButton: ElementType = () => {
  return (
    <TouchableOpacity onPress={() => toggleChangeLanguage(true)}>
      <View style={styles.container}>
        <Icon source={require('../../assets/onboarding/share.png')} width={20} />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row'
  },
  text: {
    fontSize: 17,
    marginRight: 5
  }
});

export { ShareAppButton };
