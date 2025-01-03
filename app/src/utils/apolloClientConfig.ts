import { ApolloClient, ApolloLink, HttpLink, InMemoryCache, from } from "@apollo/client";
import { onError } from "@apollo/client/link/error";
import { setContext } from '@apollo/client/link/context';
import { State } from "../redux/state";
import { backendURL } from "../config/config";

import {store} from "./reduxConfig"

// Graphql stuff =====================
const errorLink = onError(({ graphQLErrors, networkError }) => {
    if (graphQLErrors) {
        graphQLErrors.map(({ message, locations, path }) => {
            console.error(`GraphQL error: ${message}`)
        })
    }
});

const authLink = setContext((_, {headers}) => {
    const state: State = store.getState();
    const token = state.persistent.userToken;
    return {
        headers: {
            ...headers,
            authorization: token ? `Bearer ${token}` : "",
        }
    }
})

// add the authorization token to the header for graphql server
const authMiddleware = new ApolloLink((operation, forward) => {
    const state: State = store.getState();
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
    // authMiddleware,
    authLink,
    new HttpLink({ uri: backendURL })
]);

const client = new ApolloClient({
    cache: new InMemoryCache(),
    link: link
})

export {client};