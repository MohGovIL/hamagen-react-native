import { Dimensions, Insets, Platform } from 'react-native';
import DeviceInfo from 'react-native-device-info';
import ExtraDimensions from 'react-native-extra-dimensions-android';

// General
export const IS_IOS: boolean = Platform.OS === 'ios';
export const HIT_SLOP: Insets = { top: 10, bottom: 10, left: 10, right: 10 };
export const VERSION_NAME: string = DeviceInfo.getVersion();

// Dimensions
const isIPhoneXSize: boolean = Dimensions.get('window').height === 812 || Dimensions.get('window').width === 812;
const isIPhoneXrSize: boolean = Dimensions.get('window').height === 896 || Dimensions.get('window').width === 896;
export const IS_IPHONE_X: boolean = Platform.OS === 'ios' && (isIPhoneXSize || isIPhoneXrSize);

export const SCREEN_HEIGHT: number = Platform.OS === 'ios' ? Dimensions.get('window').height : ExtraDimensions.get('REAL_WINDOW_HEIGHT') - ExtraDimensions.get('SOFT_MENU_BAR_HEIGHT') - ExtraDimensions.get('STATUS_BAR_HEIGHT');
export const SCREEN_WIDTH: number = Dimensions.get('window').width;
export const PADDING_TOP = (padBy: number): number => padBy + (IS_IOS ? (IS_IPHONE_X ? 32 : 20) : 0);
export const PADDING_BOTTOM = (padBy: number): number => padBy + (IS_IPHONE_X ? 15 : 0);
export const IS_SMALL_SCREEN: boolean = SCREEN_HEIGHT < 600;

// Colors
export const MAIN_COLOR = '#0077c8';
export const TEXT_COLOR = '#191919';
export const BACK_DROP_COLOR: string = 'rgba(0,0,0,0.7)';

// Styles
export const BASIC_SHADOW_STYLES = {
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 3 },
  shadowOpacity: 0.15,
  shadowRadius: 5,
  elevation: 5,
  backgroundColor: '#fff'
};

// Keys
export const UUID_KEY = 'UUID_KEY';
export const CURRENT_LOCALE = 'CURRENT_LOCALE';
export const IS_FIRST_TIME = 'IS_FIRST_TIME';
export const VALID_EXPOSURE = 'VALID_EXPOSURE';
export const PAST_EXPOSURES = 'PAST_EXPOSURES';
export const DISMISSED_EXPOSURES = 'DISMISSED_EXPOSURES';
export const CURRENT_TERMS_VERSION = 'CURRENT_TERMS_VERSION';
export const LAST_FETCH_TS = 'LAST_FETCH_TS';
export const FIRST_POINT_TS = 'FIRST_POINT_TS';
export const LAST_POINT_START_TIME = 'LAST_POINT_START_TIME';

// GeneralWebview
export const USAGE_ON_BOARDING = 'USAGE_ON_BOARDING';
export const USAGE_PRIVACY = 'USAGE_PRIVACY';
