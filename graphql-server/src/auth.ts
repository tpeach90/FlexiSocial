/**
 * TODO: the auth is implemented according to the "naive" implementation described here:
 * https://the-guild.dev/graphql/yoga-server/tutorial/advanced/01-authentication
 * This should be changed before the app is deployed.
 */

import { JwtPayload, verify } from "jsonwebtoken";
import { User } from "./types";
import { userUuidToUserId } from "./sql/queries";
import { PoolClient } from "pg";

export const APP_SECRET = 'this is my secret'


export async function authenticateUser(client: PoolClient, request:Request){

    const header = request.headers.get("authorization");
    if (!header) {
        return null
    }

    // the token arrives in the header in the form:
    // Authorization: "Bearer MY_TOKEN_HERE"
    const token = header.split(" ")[1];

    // decrypts the token (??) using the APP_SECRET
    let tokenPayload: JwtPayload;
    try {
        tokenPayload = verify(token, APP_SECRET) as JwtPayload;
    } catch {
        console.log("An invalid token was submitted by " + request.headers.get("host"))
        return null
    }

    // remember this is how the token was signed:
    // ==== sign({ uuid }, APP_SECRET)
    const uuid = tokenPayload.uuid;

    // TODO instead of getting the uuid, this should be replaced with something else
    // ... probably. maybe something that expires.

    // find the userId
    const id = userUuidToUserId(client, uuid);

    // completely useless check, but just for clarity
    if (!id) return null;

    return id;

}