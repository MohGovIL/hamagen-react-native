import React, { useEffect } from 'react';
import { StatusBar, StyleSheet, View } from 'react-native';
import { Provider } from 'react-redux';
import { enableScreens } from 'react-native-screens';
import { NavigationContainer } from '@react-navigation/native';
import Loading from './components/Loading';
import storeFactory from './store';
import { SCREEN_HEIGHT, SCREEN_WIDTH } from './constants/Constants';

enableScreens();

const App = () => {
  useEffect(() => {
    StatusBar.setBarStyle('dark-content');
  }, []);

  return (
    <View style={styles.container}>
      <Provider store={storeFactory()}>
        <NavigationContainer>
          <Loading />
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
