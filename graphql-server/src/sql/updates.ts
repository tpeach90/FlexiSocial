import { GraphQLError } from "graphql";
import { GraphQLContext } from "../context";

import { Event as EventObj, User, UserEventRole } from "../types"
import { tileToBBox } from "../tiles";
import { zip } from "underscore";
import * as EmailValidator from 'email-validator';
import { accountWithEmailExists } from "./queries";
import { PoolClient } from "pg";



/**
 * 
 * @param displayName 
 * @param email 
 * @param hashedPassword NOT CHECKED in this function.
 * @returns uuid of new user
 */
export async function createUser(client: PoolClient, displayName:string, email:string, hashedPassword:string) {

    // check the inputs against the database schema.
    if (displayName.length < 1 || displayName.length>255) {
        throw new GraphQLError("Display name must be between 1 and 255 characters (inclusive).")
    }

    // check the email format is valid
    if (!EmailValidator.validate(email)) {
        throw new GraphQLError("Email not valid")
    };

    if (await accountWithEmailExists(client, email)) {
        throw new GraphQLError("Account with this email address already exists.")
    }

    const update = `
        INSERT INTO Users (
            DisplayName,
            Email,
            HashedPassword
        )
        VALUES ($1, $2, $3)
        RETURNING Uuid
    `
    
    const result = await client.query({ rowMode: "array", text: update }, [displayName, email, hashedPassword]);


    if (!result.rows || result.rows.length != 1) {
        console.error("Error for update: \n" + update)
        throw new GraphQLError("Internal server error")
    }

    const uuid : number = result.rows[0][0];

    return uuid;
}


export async function createProfilePictureUploadLink(client: PoolClient, userId: number) {
    // assume that the user exists. If they don't then the database update will error due to foreign key constraints.

    const update = `
        INSERT INTO ProfilePictureUploadLinks (UserId)
        VALUES ($1)
        RETURNING Link, ExpiryTimestamp
    `;

    const result = await client.query({ rowMode: "array", text: update }, [userId]);

    if (!result.rows || result.rows.length != 1) {
        console.error("Error for update: \n" + update)
        throw new Error("Internal server error")
    }

    const [Link, ExpiryTimestamp] = result.rows[0] as [string, number];

    return {link: Link, expiryTimestamp: ExpiryTimestamp}
}