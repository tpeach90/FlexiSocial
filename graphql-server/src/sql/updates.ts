import { GraphQLError } from "graphql";
import { GraphQLContext } from "../context";

import { Event as EventObj, User, UserEventInterest, UserEventRole } from "../types"
import { tileToBBox } from "../tiles";
import { zip } from "underscore";
import * as EmailValidator from 'email-validator';
import { accountWithEmailExists } from "./queries";
import { PoolClient } from "pg";
import { GraphQLGUID } from "graphql-scalars";



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
/**
 * Insert a new event into the database.
 * Assumes that the creatorId already exists.
 * @param client 
 * @param event 
 */
export async function createEvent(client: PoolClient, event:{
    creatorId: number,
    name: string,
    description: string,
    point:{
        latitude:number,
        longitude:number
    },
    location:string,
    timeString:string,
    duration:number,
    capacity?:number
}) {

    if (event.name.length < 1 || event.name.length > 255) {
        throw new GraphQLError("Event name must be between 1 and 255 characters (inclusive).")
    }
    if (event.description.length > 8000) {
        throw new GraphQLError("Event description must be at most 8000 characters.")
    }
    if (event.point.latitude < -90 || event.point.latitude > 90) {
        throw new GraphQLError("Event latitude must be in range -90 to 90 degrees (inclusive).")
    }
    if (event.point.longitude < -180 || event.point.longitude > 180) {
        throw new GraphQLError("Event longitude must be in range -180 to 180 degrees (inclusive).")
    }
    if (event.location.length < 1 || event.location.length > 255) {
        throw new GraphQLError("Event location must be between 1 and 255 characters (inclusive).")
    }
    const now = new Date(Date.now());
    const timeMs = Date.parse(event.timeString)
    if (isNaN(timeMs)) {
        throw new GraphQLError("Event time not in the Date Time String Format")
    }
    const time = new Date(timeMs);
    if (time < now) {
        throw new GraphQLError("Event cannot be in the past. (The current time is " + now.toISOString() + ")")
    }
    if (time.valueOf() > now.valueOf() + 31536000000) {
        throw new GraphQLError("Event cannot be more than a year in the future.")
    }
    if (event.duration % 1 != 0) {
        throw new GraphQLError("Event duration must be a whole number of minutes")
    }
    if (event.duration < 1) {
        throw new GraphQLError("Event duration must be positive.")
    }
    if (event.duration > 24*60) {
        throw new GraphQLError("Event duration must not exceed 1440 mins (24 hours).")
    }
    if (event.capacity !== undefined) {
        if (event.capacity % 1 != 0) {
            throw new GraphQLError("Event capacity must be a whole number")
        }
        if (event.capacity < 1) {
            throw new GraphQLError("Event capacity must be positive")
        }
        if (event.capacity > 10000) {
            throw new GraphQLError("Event capacity can't be more than 10000")
        }
    }

    await client.query("BEGIN TRANSACTION")

    try {
        // create the event.
        const update0 = event.capacity !== undefined ? `
            INSERT INTO Events(Name, Description, CreatorId, Point, Location, Time, Duration, Capacity)
            VALUES ($1, $2, $3, ST_SetSRID(ST_MakePoint($4, $5),4326), $6, $7, ($8 ||' minutes')::interval, $9)
            RETURNING Id
        ` : `
            INSERT INTO Events(Name, Description, CreatorId, Point, Location, Time, Duration)
            VALUES ($1, $2, $3, ST_SetSRID(ST_MakePoint($4, $5),4326), $6, $7, ($8 ||' minutes')::interval)
            RETURNING Id
        `
        const params0 = [
            event.name,
            event.description,
            event.creatorId,
            event.point.longitude,
            event.point.latitude,
            event.location,
            time.toISOString(),
            event.duration
        ]
        if (event.capacity !== undefined) {
            params0.push(event.capacity)
        }

        const result0 = await client.query({ rowMode: "array", text: update0 }, params0);

        if (!result0.rows || result0.rows.length != 1) {
            console.error("Error for update: \n" + update0)
            throw new Error("Internal server error")
        }

        const [eventId] = result0.rows[0] as [number];

        // add the role "organizer" for the creator of this event
        const update1 = `
            INSERT INTO UserEventRoles(UserId, EventId, Role)
            VALUES ($1, $2, 'organizer');
        `;

        const result1 = await client.query({ rowMode: "array", text: update1 }, [event.creatorId, eventId]);

        await client.query("COMMIT");

        return { eventId }

    
    } catch (e) {
        await client.query("ROLLBACK");
        throw e;
    } 

}


export async function setInterestInEvent(client: PoolClient, userId: number, eventId:number, interest:UserEventInterest) {
    
    {
        // check that the event exists.
        const query = `
            SELECT NULL FROM Events
            WHERE Id = $1
        `
        const result = await client.query({ rowMode: "array", text: query }, [eventId]);
        if (result.rows.length != 1) {
            throw new GraphQLError(`Event with id ${eventId} does not exist`)
        }
    }

    {
        // check that the user is not an organizer of this event.
        const query = `
            SELECT Role FROM UserEventRoles
            WHERE UserId=$1 AND EventId=$2
        `
        const result = await client.query({ rowMode: "array", text: query }, [userId, eventId]);
        if (result.rows.length == 1 && result.rows[0][0] == "organizer") {
            throw new GraphQLError("You are already an organizer of this event")
        }
    }


    // update
    if (interest == "none") {
        const update = `
            DELETE FROM UserEventRoles
            WHERE UserId=$1 AND EventId=$2
        `
        await client.query({ rowMode: "array", text: update }, [userId, eventId]);
    } else {
        const update = `
            INSERT INTO UserEventRoles (UserId, EventId, Role)
            VALUES ($1, $2, $3)
            ON CONFLICT (UserId, EventId) DO UPDATE
            SET Role = $4
        `
        await client.query({ rowMode: "array", text: update }, [userId, eventId, interest, interest]);
    }



}