import React, { ElementType } from 'react';
import { Alert, Share, StyleSheet, View } from 'react-native';
import { Icon, TouchableOpacity } from '.';

const ShareAppButton: ElementType = () => {
  const onShare = async () => {
    try {
      await Share.share({
        message:
                    'Hey, Please download. https://govextra.gov.il/ministry-of-health/corona/corona-virus',
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
