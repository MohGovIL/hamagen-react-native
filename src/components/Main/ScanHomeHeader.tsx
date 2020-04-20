import React from 'react';
import { View, StyleSheet, ImageBackground,TouchableWithoutFeedback, Share } from 'react-native';
import LottieView from 'lottie-react-native';
import { TouchableOpacity, Text, Icon, ChangeLanguageButton } from '../common';
import { Strings } from '../../locale/LocaleData';
import { BASIC_SHADOW_STYLES, IS_SMALL_SCREEN, PADDING_TOP, SCREEN_HEIGHT, SCREEN_WIDTH } from '../../constants/Constants';
import { onError } from '../../services/ErrorService';



const ShareBtn = () => {
  const onShare = async () => {
    try{
      const result = await Share.share({
        message: "Hamagen share"
      });

      console.log(result);
      
    }
    catch(error) {
      onError({error})
    }
  }

  return (
    <View style={{ flex:1,justifyContent: 'center', alignItems: 'flex-start'}}>
        <TouchableOpacity onPress={onShare}>
          <Icon source={require('../../assets/main/share.png')} width={20} />
        </TouchableOpacity>
    </View>
    )
}

interface Props {
  isRTL: boolean,
  strings: Strings,
  isConnected: boolean,
  showChangeLanguage: boolean,
  openDrawer(): void
}

const ScanHomeHeader = ({openDrawer}) => {
  return (
    <ImageBackground
      source={require('../../assets/main/headerBG.png')}
      style={styles.container}
      resizeMode="cover"
      resizeMethod="resize"
    >
      <View style={{flexDirection: 'row', paddingBottom: 14}}>

        <ShareBtn />

        <View style={{ flex:3, justifyContent: 'center', alignItems: 'center' }}>
          <Icon source={require('../../assets/main/headerLogo.png')} width={89} height={43} />
        </View>

        <TouchableWithoutFeedback onPress={openDrawer}>
          <View style={{ flex:1, alignItems: 'flex-end' ,justifyContent: 'center'}}>
            <Icon source={require('../../assets/main/menu.png')} width={20} />
          </View>
        </TouchableWithoutFeedback>
      </View>
      <View style={styles.subContainer} />
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    width: SCREEN_WIDTH,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: PADDING_TOP(10),
    paddingHorizontal: 20
  },
  subContainer: {
    width: SCREEN_WIDTH,
    height: 45,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    backgroundColor: '#fff'
  },
  headerItemContainer: {
    height: 45,
    alignItems: 'center'
  },
  indicatorWrapper: {
    width: 15,
    height: 15,
    alignItems: 'center',
    justifyContent: 'center'
  },
  lottie: {
    width: 15,
    height: 15
  },
  indicator: {
    ...BASIC_SHADOW_STYLES,
    width: 10,
    height: 10,
    borderRadius: 5
  },
  text: {
    fontSize: 12,
    paddingHorizontal: 5,
    maxWidth: SCREEN_WIDTH / 2.5
  }
});

export default ScanHomeHeader;
