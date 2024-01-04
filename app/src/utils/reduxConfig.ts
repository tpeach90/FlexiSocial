import persistentStore from "../redux/store"

const { store, persistor } = persistentStore();

export { store, persistor };