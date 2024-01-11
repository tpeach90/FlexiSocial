/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */
import 'react-native-gesture-handler';
import React from 'react';
import { Provider } from 'react-redux';
import AppNav from './src/navigation/AppNav';
import { PersistGate } from 'redux-persist/integration/react';
import { Text } from 'react-native';
import {  ApolloProvider } from '@apollo/client';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { persistor, store } from './src/utils/reduxConfig';
import { client } from './src/utils/apolloClientConfig';
import { GestureHandlerRootView } from 'react-native-gesture-handler';


function App(): JSX.Element {
  // const isDarkMode = useColorScheme() === 'dark';

  // const backgroundStyle = {
  //   backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
  // };

  return (
    <Provider store={store} >
      <ApolloProvider client={client}>
        <SafeAreaProvider>
          <PersistGate persistor={persistor} loading={<Text>Loading</Text>}>
            <GestureHandlerRootView style={{flex:1}}>
              <AppNav />
            </GestureHandlerRootView>
          </PersistGate>
        </SafeAreaProvider>
      </ApolloProvider>
    </Provider>
  );
}

export default App;
