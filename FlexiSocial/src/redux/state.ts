import { ScreenStackOptions } from "../utils/types";

// typing of the state.
export type StatePersistentSlice = {
    userToken: string | null,

    mapScreen: {
        toggles: {
            today: boolean,
            tomorrow: boolean,
            thisWeek: boolean,
            thisMonth: boolean,
        }
    }
}
export type StateNonPersistentSlice = {
    screenStack: ScreenStackOptions | null
}

export type State = {
    nonPersistent: StateNonPersistentSlice
    persistent: StatePersistentSlice,
}



// initial state
export const initialPersistentState: StatePersistentSlice = {
    userToken: null,
    mapScreen: {
        toggles: {
            today: true,
            tomorrow: true,
            thisWeek: true,
            thisMonth: true,
        }
    }
};
export const initialNonPersistentState: StateNonPersistentSlice = {
    screenStack: "debug",
}