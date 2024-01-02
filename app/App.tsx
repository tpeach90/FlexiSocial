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
import { ApolloClient, ApolloLink, ApolloProvider, HttpLink, InMemoryCache, from } from '@apollo/client';
import { onError } from "@apollo/client/link/error" 
import { backendURL } from './src/config/config';
import { State } from './src/redux/state';
import { SafeAreaProvider } from 'react-native-safe-area-context';
const { store, persistor } = persistentStore();

// Graphql stuff =====================
const errorLink = onError(({graphQLErrors, networkError}) => {
  if (graphQLErrors) {
    graphQLErrors.map(({message, locations, path}) => {
      console.error(`GraphQL error: ${message}`)
    })
  }
});

// add the authorization token to the header for graphql server
const authMiddleware = new ApolloLink((operation, forward) => {
  const state : State = store.getState();
  const token = state.persistent.userToken;
  operation.setContext({
    headers: {
      authorization: token ? `Bearer ${token}` : "",
    },
  });
  return forward(operation);
});

const link = from([
  errorLink,
  authMiddleware,
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
    <Provider store={store} >
      <PersistGate persistor={persistor} loading={<Text>Loading</Text>}>
        <ApolloProvider client={client}>
          <SafeAreaProvider>
            <AppNav />
          </SafeAreaProvider>
        </ApolloProvider>
      </PersistGate>
    </Provider>
  );
}

export default App;
