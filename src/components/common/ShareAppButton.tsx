import React, { ElementType } from 'react';
import { Alert, Share, StyleSheet, View } from 'react-native';
import { Icon, TouchableOpacity } from '.';
import config from '../../config/config';

type Props = {
  locale: 'he'|'en'|'ar'|'am'|'ru',
}

const ShareAppButton: ElementType = ({ locale }:Props) => {
  const onShare = async () => {
    try {
      const furtherInstructions = config.furtherInstructions[locale];

      await Share.share({
        message: `Hey, Please download. ${furtherInstructions}`,
      });
    } catch (error) {
      Alert.alert(error.message);
    }
  };

  return (
    <TouchableOpacity onPress={onShare}>
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
