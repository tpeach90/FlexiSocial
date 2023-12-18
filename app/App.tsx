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
import { ApolloClient, ApolloProvider, HttpLink, InMemoryCache, from } from '@apollo/client';
import { onError } from "@apollo/client/link/error" 
import { backendURL } from './src/config/config';
const { store, persistor } = persistentStore();

// Graphql stuff =====================
const errorLink = onError(({graphQLErrors, networkError}) => {
  if (graphQLErrors) {
    graphQLErrors.map(({message, locations, path}) => {
      console.error(`GraphQL error: ${message}`)
    })
  }
});

const link = from([
  errorLink,
  new HttpLink({uri: backendURL})
]);

const client = new ApolloClient({
  cache: new InMemoryCache(),
  link: link
})





function App(): JSX.Element {
  // const isDarkMode = useColorScheme() === 'dark';

  // const backgroundStyle = {
  //   backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
  // };

  return (
    // <AuthProvider>
    <ApolloProvider client={client}>
      <Provider store={store} >
        <PersistGate persistor={persistor} loading={<Text>Loading</Text>}>
          <AppNav/>
        </PersistGate>
      </Provider>
    </ApolloProvider>
    // </AuthProvider>
  );
}

export default App;
