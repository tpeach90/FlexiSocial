import {gql} from "@apollo/client";


/**
 * Get basic info about event with id `id`.
 * Not including the event chat.
 */
export const GET_EVENT = gql`
    query GetEvent($id: Int!) {
        event(id: $id) {
            id
            name
            description
            creator {
                id
                displayName
            }
            location
            capacity
            lat
            lon
            time
            duration
            stats {
                goingCount
                interestedCount
            }
        }
    }

`

export const GET_CHAT = gql`
    query GetChat($id: Int!, $maxChatMessages: Int!) {
        event(id: $id) {
            id
            chat {
                count
                messageQuery(last: $maxChatMessages) {
                    messages {
                        id
                        author {
                            id
                            displayName
                            roleInEvent(eventId:$id)
                        }
                        time
                        content
                        reply {
                            id
                            author {
                                id
                                displayName
                            }
                        }
                    }
                }
            }
        }
    }
`

export const GET_EVENT_AND_CHAT = gql`
    query GetEventAndChat($id: Int!, $maxChatMessages: Int!) {
        event(id: $id) {
            id
            name
            description
            creator {
                id
                displayName
            }
            location
            capacity
            lat
            lon
            time
            duration
            chat {
                count
                messageQuery(last: $maxChatMessages) {
                    hasMore
                    messages {
                        id
                        author {
                            id
                            displayName
                        }
                        time
                        content
                        reply {
                            id
                            author {
                                displayName
                            }
                        }
                    }
                }
            }
        }
    }

`

export const GET_EVENTS_ON_SCREEN = gql`
    query GetEventsOnScreen($east:Float!, $west:Float!, $north:Float!, $south:Float!, $earliest:Timestamp!, $excludeTiles:[Int!]) {
        eventsInBBox(east: $east, west: $west, north: $north, south: $south, earliest: $earliest, excludeTiles: $excludeTiles) {
            tilesLoaded
            events {
                id
                name
                lat
                lon
            }
        }
    }
`

export const GET_USER = gql`
    query GetUser($id:Int!) {
        user(id:$id) {
            id
            displayName
            role
            bio
            stats {
                eventsOrganizedCount
            }
            registerTimestamp
        }
    }
`

export const GET_MY_ID = gql`
    query GetMyId {
        me {
            user {
                id
            }
        }
    }
`