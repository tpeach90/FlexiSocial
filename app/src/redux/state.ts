import { ScreenStackOptions } from "../utils/types";

export type Toggle = "today" | "tomorrow" | "thisWeek" | "thisMonth"

// typing of the state.
export type StatePersistentSlice = {
    userToken: string | null,

    mapScreen: {
        toggles: Record<Toggle,boolean>
    }
}
export type StateNonPersistentSlice = {
    screenStack: ScreenStackOptions | null,
    mapScreen: {

        markers: {
            id: number,
            name: string,
            lat: number,
            lon: number
        }[],
        tilesLoaded: number[],
        eventInfo: {
            active: true,
            eventId: number
        } |
        {
            active: false,
            eventId?: number
        }
        
    },
    userScreen: {
        
    }
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
    screenStack: "auth",
    mapScreen: {
        markers:[],
        tilesLoaded:[],
        eventInfo: {
            active: false,
        }
    },
    userScreen: {
        
    }
}