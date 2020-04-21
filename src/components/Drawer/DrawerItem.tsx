import * as React from 'react';
import {
  Text,
  View,
  StyleSheet,
  StyleProp,
  ViewStyle,
  TextStyle,
  TouchableOpacity
} from 'react-native';
import { CommonActions, DrawerActions, DrawerNavigationState } from '@react-navigation/native';


type Props = {
  /**
   * The label text of the item.
   */
  label:
    | string
    | ((props: { focused: boolean; color: string }) => React.ReactNode);
  /**
   * Icon to display for the `DrawerItem`.
   */
  icon?: (props: {
    focused: boolean;
    size: number;
  }) => React.ReactNode;
  /**
   * Whether to highlight the drawer item as active.
   */
  focused?: boolean;
  /**
   * Function to execute on press.
   */
  onPress: () => void;
  /**
   * Color for the icon and label when the item is active.
   */
  activeTintColor?: string;
  /**
   * Color for the icon and label when the item is inactive.
   */
  inactiveTintColor?: string;
  /**
   * Background color for item when its active.
   */
  activeBackgroundColor?: string;
  /**
   * Background color for item when its inactive.
   */
  inactiveBackgroundColor?: string;
  /**
   * Style object for the label element.
   */
  labelStyle?: StyleProp<TextStyle>;
  /**
   * Style object for the wrapper element.
   */
  style?: StyleProp<ViewStyle>;
};

/**
 * A component used to show an action item with an icon and a label in a navigation drawer.
 */
const DrawerItem = (props: Props) => {
  const {
    isRTL,
    icon,
    label,
    labelStyle,
    focused = false,
    inactiveBackgroundColor = 'transparent',
    style,
    onPress,
    navigation,
    name,
    ...rest
  } = props;

  const iconNode = icon ? icon({ size: 24, focused }) : null;

  return (
    <View style={{ borderBottomColor: 'white',
      borderBottomWidth: 1.5, }}
    >

      <TouchableOpacity
        {...rest}
        style={[styles.container, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}
        onPress={() => {
          navigation.dispatch({
            ...(focused
              ? DrawerActions.closeDrawer()
              : CommonActions.navigate(name))
          });
        }}
      >
        {iconNode}
        <Text style={[styles.label, isRTL ? styles.labelRight : styles.labelLeft]}>{label}</Text>

      </TouchableOpacity>
    </View>

  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 10,
    marginVertical: 4,
    paddingVertical: 20,
    overflow: 'hidden',
    padding: 8,
    alignItems: 'center'
  },
  label: {
    fontSize: 18
  },
  labelRight: {
    marginRight: 19,
  },
  labelLeft: {
    marginLeft: 19,
  },
});

export default DrawerItem;


/*

navigation.dispatch({
            ...(focused
              ? DrawerActions.closeDrawer()
              : CommonActions.navigate(route.name)),
            target: state.key,
          })

*/
