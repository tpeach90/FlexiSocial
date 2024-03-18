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
            eventId: number,
            title: string,
            displayChat: boolean
        } |
        {
            active: false,
            eventId?: number,
            title?: string,
            displayChat?: boolean
        },
        sideMenuActive: boolean
        
    },
    userScreen: {
        
    },
    isLoading:boolean
}

export type State = {
    nonPersistent: StateNonPersistentSlice
    persistent: StatePersistentSlice,
}



// initial state
export const initialPersistentState: StatePersistentSlice = {
    userToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1dWlkIjoiNDQ4N2ViNWYtZDUyMC00NWUwLTg5MzUtMjE3ZDA2MDE2YmFhIiwiaWF0IjoxNzA5NjcwMjAyfQ.WMnzeaPzPUdlEgnypZBH6WQ5cVFukVDmdhmW-X8iDLI", // todo remember to remove this. This is jamir ochoa's token
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
        markers:[],
        tilesLoaded:[],
        eventInfo: {
            active: false,
        },
        sideMenuActive: false
    },
    userScreen: {
        
    },
    isLoading:false
}