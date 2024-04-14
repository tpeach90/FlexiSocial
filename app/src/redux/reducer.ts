
// type of all possible redux states the app can be in

import { combineReducers } from "@reduxjs/toolkit"
import { ScreenStackOptions } from "../utils/types"
import { State, StateNonPersistentSlice, StatePersistentSlice, initialNonPersistentState, initialPersistentState } from "./state"


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
} | 
{
    type: "addMarkers",
    payload: {
        newTilesLoaded: number[],
        markers: StateNonPersistentSlice["mapScreen"]["markers"]
    }
} |
{
    type: "clearMarkers",
    payload?:any
} |
{
    type: "setEventInfoPanelStatus",
    payload: StateNonPersistentSlice["mapScreen"]["eventInfo"]
} |
{
    type: "setUserScreenId",
    payload: {
        id?: number
    }
} |
{
    type: "setMapScreenSideMenuActive",
    payload: boolean
} |
{
    type: "setLoading",
    payload: boolean
} |
{
    type: "setEventMostRecentChatMessageViewed",
    payload: {
        eventId: number,
        timestamp: string
    }
}




/**
 * @param state The non-persistent slice of the state
 * @param action 
 * @returns Updated non-persistent slice of the state
 */
function nonPersistentReducer(state: StateNonPersistentSlice = initialNonPersistentState, action: Action ): StateNonPersistentSlice
{
    // // handle arrays - multiple actions done at once
    // if (Array.isArray(action)) {
    //     let newState = state;
    //     for (const a of action) {
    //         newState = nonPersistentReducer(newState, a);
    //     }
    //     return newState;
    // }

    switch (action.type) {

        case "setScreenStack":
            return {
                ...state,
                screenStack: action.payload.value
            }

        case "addMarkers":
            return {
                ...state,
                mapScreen: {
                    ...state.mapScreen,
                    markers: [
                        ...state.mapScreen.markers,
                        ...action.payload.markers
                    ],
                    tilesLoaded: [
                        ...state.mapScreen.tilesLoaded,
                        ...action.payload.newTilesLoaded
                    ]
                }
            }

        case "setEventInfoPanelStatus":
            return {
                ...state,
                mapScreen: {
                    ...state.mapScreen,
                    eventInfo: action.payload
                }
            }
        
        case "setMapScreenSideMenuActive":
            if (action.payload)
                return {
                    ...state,
                    mapScreen: {
                        ...state.mapScreen,
                        sideMenuActive: true,
                        eventInfo: {
                            ...state.mapScreen.eventInfo,
                            active: false
                        },
                    },

                }
            else 
                return {
                    ...state,
                    mapScreen: {
                        ...state.mapScreen,
                        sideMenuActive: false
                    }
                }
        case "clearMarkers": 
            return {
                ...state,
                mapScreen: {
                    ...state.mapScreen,
                    markers: [],
                    tilesLoaded: []
                }
            }
        case "setLoading":
            return {
                ...state,
                isLoading: action.payload
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
        
        case "setEventMostRecentChatMessageViewed":
            return {
                ...state,
                events: {
                    ...state.events,
                    [action.payload.eventId]: {
                        ...state.events[action.payload.eventId],
                        mostRecentChatMessageViewed: action.payload.timestamp
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