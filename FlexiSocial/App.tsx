/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React from 'react';

import { Provider } from 'react-redux';
// import store from './src/redux/store';
import { AuthProvider } from './src/context/AuthContext';
import AppNav from './src/navigation/AppNav';
import { PersistGate } from 'redux-persist/integration/react';
import persistentStore from "./src/redux/store"
import { Text } from 'react-native';
const { store, persistor } = persistentStore();


function App(): JSX.Element {
  // const isDarkMode = useColorScheme() === 'dark';

  // const backgroundStyle = {
  //   backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
  // };

  return (
    // <AuthProvider>
      <Provider store={store} >
        <PersistGate persistor={persistor} loading={<Text>Loading</Text>}>
          <AppNav/>
        </PersistGate>
      </Provider>
    // </AuthProvider>
  );
}

export default App;
