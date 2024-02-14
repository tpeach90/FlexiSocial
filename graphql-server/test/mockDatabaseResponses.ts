import * as MOCK from "./mockObjects"

/* For every query/update proceedure function, this file contains an array off functions to generate mock database responses.
 * Eg some functions in updates.ts have multiple queries to the database 
 */

export const GET_EVENT = [
    (eventExists: boolean) => ({
        rows: eventExists ? [[
            MOCK.event1.name,
            MOCK.event1.description,
            MOCK.event1.creatorId,
            MOCK.event1.location,
            MOCK.event1.lon,
            MOCK.event1.lat,
            MOCK.event1.time,
            MOCK.event1.duration, // 1 hour
            MOCK.event1.capacity,
            MOCK.event1.createdTimestamp,
        ]] : []
    })
]

/**
 * Odd number ids exist. Even don't (unless allExist=true)
 * @param ids 
 * @returns 
 */
export const GET_EVENTS = [
    (ids: number[], allExist: boolean = true) => ({
        rows: ids.filter(id => allExist || id % 2 == 1).map(id => [
            id,
            MOCK.event1.name,
            MOCK.event1.description,
            MOCK.event1.creatorId,
            MOCK.event1.location,
            MOCK.event1.lon,
            MOCK.event1.lat,
            MOCK.event1.time,
            MOCK.event1.duration, // 1 hour
            MOCK.event1.capacity,
            MOCK.event1.createdTimestamp,
        ])
    })
]

export const GET_CHAT_MESSAGE_COUNT = [
    () => ({
        rows: [[5]]
    })
];

export const QUERY_CHAT_MESSAGES = [
    (amount: number) => ({
        //  [[1], [2], ..., [amount]]
        rows: [...Array(amount).keys()].map(id => [id + 1])
    })
]

export const GET_CHAT_MESSAGE = [
    (exists: boolean, isReply: boolean = false) => ({
        rows: exists ? [[
            1,
            1,
            Date.now(),
            "Sample chat message",
            isReply ? 1 : null
        ]] : [[]]
    })
]

/**
 * Odd number Ids: not a reply. Even number Ids: reply.
 * Ids with multples of 3 don't exist if allExist=false.
 * @param ids 
 * @returns 
 */
export const GET_CHAT_MESSAGES = [
    (ids: number[], allExist: boolean = true) => ({
        rows: ids.filter(id => allExist || id % 3 != 0).map(id => [
            id,
            1,
            1,
            Date.now(),
            "Sample chat message",
            id % 2 == 0 ? 1 : null
        ])
    })
]

export const GET_USER = [
    () => ({
        rows: [[
            MOCK.user1.displayName,
            MOCK.user1.role,
            MOCK.user1.bio,
            MOCK.user1.registerTimestamp
        ]]
    })
]

export const GET_USERS = [
    (ids: number[], allExist: boolean = true) => ({
        rows: ids.filter(id => allExist || id % 2 != 1).map(id => [
            id,
            MOCK.user1.displayName,
            MOCK.user1.role,
            MOCK.user1.bio,
            MOCK.user1.registerTimestamp
        ])
    })
]

export const GET_EVENT_STATS = [
    (counts: { going: number, interested: number, organizer: number }) => ({
        rows: [
            ...(counts.going > 0 ? [["going", counts.going]] : []),
            ...(counts.interested > 0 ? [["interested", counts.interested]] : []),
            ...(counts.organizer > 0 ? [["organizer", counts.organizer]] : [])
        ]
    })
]

export const GET_EVENT_IDS_ORGANIZED_BY_USER = [
    (ids: number[]) => ({
        rows: ids.map(id => [id])
    })
]

export const GET_NUM_EVENTS_ORGANIZED_BY_USER = [
    (count: number) => ({
        rows: [[count]]
    })
]

export const GET_EVENT_IDS_IN_TILE = [
    (count: number) => ({
        rows: [...Array(count).keys()].map(id => [id + 1])
    })
]

/**
 * If id % 4 = 0, then 'none', = 1 then 'interested', = 2 then 'going', = 3 then 'organizer;
 * @param ids 
 * @returns 
 */
export const GET_USER_ROLES_IN_EVENT = [
    (ids: number[]) => ({
        rows: ids.filter(id => id % 4 != 0).map(id => [
            id,
            id % 4 == 1 ? 'interested' :
                id % 4 == 2 ? 'going' :
                    'organizer'

        ])
    })
]

export const CHECK_EMAIL_AND_PASSWORD = [
    (accountExists: boolean, passwordHash: string = "") => ({
        rows: accountExists ? [[
            "8a06d40b8d0a4125bf00335d603e3362",
            passwordHash
        ]] : []
    })
]

export const USER_UUID_TO_USER_ID = [
    (accountExists: boolean) => ({
        rows: accountExists ? [[1]] : []
    })
]

export const ACCOUNT_WITH_EMAIL_EXISTS = [
    (accountExists: boolean) => ({
        rows: accountExists ? [[1]] : [[0]]
    })
]

export const GET_USER_SENSITIVE_INFO = [
    (accountExists: boolean, email: string) => ({
        rows: accountExists ? [[email]] : [[]]
    })
]

export const GET_PFP_STORE_FILENAME = [
    (pfpExists: boolean) => ({
        rows: pfpExists ? [["8a06d40b8d0a4125bf00335d603e3362"]] : [[]]
    })
]

/**
 * Odd number ids exist. Even don't.
 * @param ids 
 * @returns 
 */
export const GET_PFP_STORE_FILENAMES = [
    (ids: number[], allExist: boolean = true) => ({
        rows: ids.filter(id => allExist || id % 2 == 1).map(id => [
            id,
            "8a06d40b8d0a4125bf00335d603e3362"
        ])
    })
]

