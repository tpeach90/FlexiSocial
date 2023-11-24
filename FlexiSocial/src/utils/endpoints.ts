import { jsonToGraphQLQuery } from "json-to-graphql-query";
import { backendURL } from "../config/config";
import { UserInfo } from "./types";


/***
 * Probably want to replace this whole file with some state management thing at some point.
 * Can look into @apollo/client maybe.
 */


async function sendRequest(query: any) {

    console.log(jsonToGraphQLQuery(query));

    const response = await fetch(backendURL, {
        method: "POST",
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            query: jsonToGraphQLQuery(query)
        })
    });

    if (!response.ok || response.body == null) {
        console.error(response)
        return null;
    }

    // parse result
    const result = await response.json();

    if ("errors" in result) {
        for (const error of result.errors) {
            console.error(error);
        }
        return null;
    }

    return result;

}


/**
 * Login and get the login information back.
 * this method is very probably NOT SECURE! the password is passed in plaintext
 * TODO FIX TODO FIX TODO FIX TODO FIX TODO FIX TODO FIX
 * Only intended to be a quick thing for testing
 * @param email 
 * @param password
 * @deprecated There is no replacement currently, but do not under any circumstances let this into the final version.
 */
async function login(email: string, password: string) {

    const result = await sendRequest({
        mutation: {
            login :{
                __args: {
                    // login with email and password
                    email: email, 
                    password: password
                },
                user : {
                    // request this information about the user back
                    name: true,
                    age: true,
                },
                token: true
            }
        }
    });

    const userInfo : UserInfo = {
        name: result.data.login.user.name,
        age: result.data.login.user.name,
    }

    const token : string = result.data.login.token;

    return {userInfo, token};

}

export default {
    login
}