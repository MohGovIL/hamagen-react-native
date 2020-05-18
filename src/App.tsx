import React, { useEffect, useRef } from 'react';
import { Linking, StatusBar, StyleSheet, View } from 'react-native';
import { Provider } from 'react-redux';
import { enableScreens } from 'react-native-screens';
import { NavigationContainer } from '@react-navigation/native';
import Loading from './components/Loading';
import { onOpenedFromDeepLink } from './services/DeepLinkService';
import storeFactory from './store';
import { SCREEN_HEIGHT, SCREEN_WIDTH } from './constants/Constants';

enableScreens();

const App = () => {
  const navigationRef = useRef<any>(null);

  useEffect(() => {
    StatusBar.setBarStyle('dark-content');

    Linking.addEventListener('url', (data) => {
      navigationRef.current && onOpenedFromDeepLink(data.url, navigationRef.current);
    });
  }, []);

  return (
    <View style={styles.container}>
      <Provider store={storeFactory()}>
        <NavigationContainer ref={navigationRef}>
          <Loading navigation={navigationRef.current} />
        </NavigationContainer>
      </Provider>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT
  }
});

export default App;
