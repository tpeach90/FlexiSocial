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