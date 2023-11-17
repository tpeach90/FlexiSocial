// import { createStore } from 'redux'
import { configureStore } from '@reduxjs/toolkit'
import { persistStore, persistReducer, FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER } from 'redux-persist'
// import storage from 'redux-persist/lib/storage' // defaults to localStorage for web

import rootReducer from './reducer'
import AsyncStorage from '@react-native-async-storage/async-storage'

const persistConfig = {
    key: 'root',
    storage : AsyncStorage,
    whitelist: ["persistent"] // only persist the persistent slice of the store.
}

export default () => {
    const store = configureStore({
        reducer: persistReducer(persistConfig, rootReducer),
        middleware: (getDefaultMiddleware) =>
            getDefaultMiddleware({
                serializableCheck: {
                    ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
                },
            }),
    })

    let persistor = persistStore(store);

    return {store, persistor};
}


