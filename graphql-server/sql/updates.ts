import { GraphQLError } from "graphql";
import { connection } from "../connection";
import { GraphQLContext } from "../context";

import { Event as EventObj, User, UserEventRole } from "../types"
import { tileToBBox } from "../tiles";
import { zip } from "underscore";


/**
 * 
 * @param displayName 
 * @param email 
 * @param hashedPassword 
 * @returns uuid of new user
 */
export async function createUser(displayName:string, email:string, hashedPassword:string) {

    const update = `
        INSERT INTO Users (
            DisplayName,
            Email,
            HashedPassword
        )
        VALUES ($1, $2, $3)
        RETURNING Uuid
    `

    const result = await connection.query(update, { params: [displayName, email, hashedPassword]})

    if (!result.rows || result.rows.length != 1) {
        console.error("Error for update: \n" + update)
        throw new GraphQLError("Internal server error")
    }

    const uuid : number = result.rows[0][0];

    return uuid;
}