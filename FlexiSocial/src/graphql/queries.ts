import {gql} from "@apollo/client";


/**
 * Get basic info about event with id `id`.
 * Not including the event chat.
 */
export const GET_EVENT = gql`
    query GetEvent($id: Int!) {
        event(id: $id) {
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

export const GET_EVENT_AND_CHAT = gql`
    query GetEventAndChat($id: Int!, $maxChatMessages: Int!) {
        event(id: $id) {
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