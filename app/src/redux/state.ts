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
        eventData: Record<Toggle, {
            markers: {
                eventId: number,
                name: string
            }[],
            tilesLoaded: number[]
        }>,
        
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
    screenStack: "app",
    mapScreen: {
        eventData: {
            today: {
                markers:[],
                tilesLoaded:[]
            },
            tomorrow: {
                markers: [],
                tilesLoaded: []
            },
            thisWeek: {
                markers: [],
                tilesLoaded: []
            },
            thisMonth: {
                markers: [],
                tilesLoaded: []
            }
        }
    }
}