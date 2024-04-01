import { gql } from "@apollo/client";


export const SIGN_UP = gql`
    mutation SignUp($email: String!, $password: String!, $displayName: String!) {
        signup(email: $email, password: $password, displayName: $displayName) {
            token
        }
    }
`

export const LOGIN = gql`
    mutation Login($email: String!, $password: String!) {
        login(email: $email, password: $password) {
            token
        }
    }
`

export const CREATE_EVENT = gql`
    mutation CreateEvent($name: String!, $description: String!, $latitude: Float!, $longitude:Float!, $location: String!, $time: String!, $duration: Int!, $capacity: Int) {
        createEvent(name: $name, description: $description, latitude: $latitude, longitude: $longitude, location: $location, time: $time, duration: $duration, capacity: $capacity) {
            eventId
        }
    }
`

export const SET_INTEREST = gql`
    mutation SetInterestGoing($eventId: Int!, $interest: UserEventInterest!) {
        setInterestInEvent(eventId: $eventId, interest: $interest) {
            success
        }
    }
`
