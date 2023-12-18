
// type of all possible redux states the app can be in

import { combineReducers } from "@reduxjs/toolkit"
import { ScreenStackOptions } from "../utils/types"
import { StateNonPersistentSlice, StatePersistentSlice, initialNonPersistentState, initialPersistentState } from "./state"


// all actions that the reducer implements.
export type Action = {
    type: "setUserToken",
    payload: {
        value: string | null
    }
} |
{
    type: "setScreenStack",
    payload: {
        value: ScreenStackOptions | null
    }
} |
{
    type: "setMapScreenToggle",
    payload: Partial<StatePersistentSlice["mapScreen"]["toggles"]>
}




/**
 * @param state The non-persistent slice of the state
 * @param action 
 * @returns Updated non-persistent slice of the state
 */
function nonPersistentReducer(state: StateNonPersistentSlice = initialNonPersistentState, action: Action): StateNonPersistentSlice
{
    switch (action.type) {

        case "setScreenStack":
            return {
                ...state,
                screenStack: action.payload.value
            }

        
        default: return state;
    }
}

/**
 * @param state The persistent slice of the state
 * @param action 
 * @returns Updated persistent slice of the state
 */
function persistentReducer(state: StatePersistentSlice = initialPersistentState, action: Action): StatePersistentSlice {
    switch (action.type) {

        case "setUserToken":
            return {
                ...state,
                userToken: action.payload.value
            }
        
        case "setMapScreenToggle":
            return {
                ...state,
                mapScreen: {
                    ...state.mapScreen,
                    toggles : {
                        ...state.mapScreen.toggles,
                        ...action.payload
                    }
                }
            }

        default: return state;
    }
}

const rootReducer = combineReducers({
    nonPersistent: nonPersistentReducer,
    persistent: persistentReducer,
});

export default rootReducer;