import React from 'react';
import { StyleSheet, View } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useDispatch, useSelector } from 'react-redux';
import { ActionButton, CloseButton } from '../common';
import { ShareUserLocations } from '../../actions/DeepLinkActions';
import { Strings } from '../../locale/LocaleData';
import { LocaleReducer, Store } from '../../types';

interface Props {
  route: any,
  navigation: StackNavigationProp<any>,
  strings: Strings
}

const ShareLocations = ({ route, navigation }: Props) => {
  const { token } = route.params;

  const { strings } = useSelector<Store, LocaleReducer>(state => state.locale);
  const dispatch = useDispatch();

  return (
    <View style={styles.container}>
      <CloseButton onPress={() => navigation.pop()} />
      <ActionButton text="Share Locations" onPress={() => dispatch(ShareUserLocations(token, navigation))} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  }
});

export default ShareLocations;
