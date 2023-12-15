import { GraphQLError } from "graphql";
import { connection } from "./connection";
import { GraphQLContext } from "./context";

import {Event as EventObj, User} from "./types"


/**
 * returns all the events within the bounding box.
 * @param north 
 * @param south 
 * @param east 
 * @param west 
 * @param context 
 * @returns 
 */
export async function eventsInBoundingBox(
    north: number, 
    south: number, 
    east: number, 
    west: number, 
    context: GraphQLContext
): Promise<EventObj[]> {

    // connection.query()

    return [];
}

export async function getEvent(id: bigint) : Promise<EventObj | null> {

    const query = `
        SELECT 
            Name, 
            Description, 
            CreatorId,
            Location, 
            ST_X(Point), 
            ST_Y(Point), 
            Time, 
            extract(epoch from duration),
            Capacity
        FROM Events
        WHERE id=$1
    `

    const result = await connection.query(query, {params: [id]});

    if (!result.rows) {
        console.error("Error for query: \n" + query)
        throw new GraphQLError("Internal server error")
    }

    if (result.rows.length != 1) {
        return null
    }

    const event = result.rows[0];

    return {
        id: id,
        name : event[0],
        description: event[1],
        creatorId : event[2],
        location: event[3],
        lat: event[4],
        lon: event[5],
        time: event[6],
        duration: event[7],
        capacity: event[8]
    };
}


export async function getEvents(ids: readonly number[]) {
    const query = `
        SELECT
            Id, 
            Name, 
            Description, 
            CreatorId,
            Location, 
            ST_X(Point), 
            ST_Y(Point), 
            Time, 
            extract(epoch from duration),
            Capacity
        FROM Events
        WHERE id=ANY($1)
    `

    const result = await connection.query(query, { params: [ids] });

    if (!result.rows) {
        console.error("Error for query: \n" + query)
        throw new GraphQLError("Internal server error")
    }

    // need to return in the same order as the input.

    // map from id to object.
    const userMap = new Map(result.rows.map((row) => 
        [row[0], {
            id: row[0],
            name: row[1],
            description: row[2],
            creatorId: row[3],
            location: row[4],
            lat: row[5],
            lon: row[6],
            time: row[7],
            duration: row[8],
            capacity: row[9]
        }]
    ));

    return ids.map((id) => userMap.get(id) ?? null)

}

/**
 * Number of chat messages made on an event.
 * @param eventId
 * @returns 
 */
export async function getChatMessageCount(eventId: bigint): Promise<bigint | null> {
    const query = `
        SELECT COUNT(*)
        FROM ChatMessages
        WHERE eventId=$1  
    `

    const result = await connection.query(query, { params: [eventId] });

    if (!result.rows) {
        console.error("Error for query: \n" + query)
        throw new GraphQLError("Internal server error")
    }

    if (result.rows.length != 1) {
        throw new Error("No rows in a COUNT(*) query result for some reason?");
    }

    return result.rows[0][0];
}

export async function queryChatMessages(options: {
    eventId: number, 
    first?: number,
    last?: number,
    fromTime?: Date,
    toTime?: Date,
    fromId?: number,
    toId?: number
}) {


    // determine which messages to get.
    // defaults: 
    let selectionMode: "first" | "last" = "last"; 
    let amountToGet: number = 10;

    // user can override these values with their query.
    if (options.last !== undefined) {
        amountToGet = options.last
        selectionMode = "last"
    }
    else if (options.first !== undefined) {
        amountToGet = options.first;
        selectionMode = "first";
    }

    // how the range of messages is to be calculated.
    let fromMode: "id" | "timestamp" | "none" = "none";
    let toMode: "id" | "timestamp" | "none" = "none";
    if (options.fromId !== undefined)
        fromMode = "id";
    else if (options.fromTime !== undefined)
        fromMode = "timestamp";
    if (options.toId !== undefined)
        toMode = "id"
    else if (options.toTime !== undefined)
        toMode = "timestamp";


    // build the query.
    // if the user is querying by id then we need to convert the id to a timestamp.
    var i = 1;
    var values: any[] = [];

    values[i] = options.eventId;
    let query = `
        SELECT Id
        FROM ChatMessages
        WHERE EventId = $${i++}
    `
    // add restictions for the time of the messages.
    switch (fromMode) {
        case "timestamp":
            values[i] = options.fromTime?.toISOString();
            query += `
                AND Time > $${i++}::timestamp
            `
            break;
        case "id":
            values[i] = options.fromId;
            query += `
                AND Time > (
                    SELECT time
                    FROM ChatMessages
                    WHERE id=$${i++}
                )
            `
            break;
        case "none":
    }

    switch (toMode) {
        case "timestamp":
            values[i] = options.toTime?.toISOString();
            query += `
                AND Time < $${i++}::timestamp
            `
            break;
        case "id":
            values[i] = options.toId;
            query += `
                AND Time < (
                    SELECT time
                    FROM ChatMessages
                    WHERE id=$${i++}
                )
            `
            break;
        case "none":
    }

    query += `
        ORDER BY Time
    `

    // if we want the last in the range flip the list around
    // so that LIMIT gives us the corrent results.
    // we will have to change it back to the correct direction when we get the result.
    if (selectionMode == "last")
        query += `
            DESC
        `
    // get 1 more than the amount requested.
    // If the database returns amountToGet + 1 items then we can tell the user that there are more item that they should make a separate request for.
    values[i] = amountToGet + 1;
    query += `
        LIMIT $${i++}
    `

    // so far `$1` in the query goes with value `values[1]`
    // but the list needs to start at 0
    // so remove the first `undefined` index and shift everything backwards by 1
    values = values.slice(1)

    const result = await connection.query(query, { params: values });

    if (!result.rows) {
        console.error("Error for query: \n" + query)
        throw new GraphQLError("Internal server error")
    }

    let messageIds = result.rows.map(([id]) => id)

    // whether there are more items than amountToGet.
    const hasMore = messageIds.length > amountToGet;

    // discard extra ids
    messageIds = messageIds.slice(0, amountToGet)

    // convert back to forwards chronalogical order if we were doing newest first
    if (selectionMode == "last")
        messageIds.reverse()

    const count = messageIds.length;

    return { count, messageIds, hasMore }

}

export async function getChatMessage(id: number) {

    const query = `
        SELECT
            EventId,
            AuthorId,
            Time,
            Content,
            ReplyingToId
        FROM ChatMessages
        LEFT JOIN ChatReplies
        	ON Id = MessageId
        WHERE Id=$1
    `

    const result = await connection.query(query, { params: [id] });

    if (!result.rows) {
        console.error("Error for query: \n" + query)
        throw new GraphQLError("Internal server error")
    }

    if (result.rows.length != 1) {
        return null
    }

    return {
        id: id,
        eventId: result.rows[0][0],
        authorId: result.rows[0][1],
        time: result.rows[0][2],
        content: result.rows[0][3],
        replyingToId: result.rows[0][4],
    }


}

export async function getChatMessages(ids: readonly number[]) {
    const query = `
        SELECT
            Id,
            EventId,
            AuthorId,
            Time,
            Content,
            ReplyingToId
        FROM ChatMessages
        LEFT JOIN ChatReplies
        	ON Id = MessageId
        WHERE Id=ANY($1)
    `

    const result = await connection.query(query, { params: [ids] });

    if (!result.rows) {
        console.error("Error for query: \n" + query)
        throw new GraphQLError("Internal server error")
    }
    
    const messageMap = new Map(result.rows.map((row) =>
        [row[0], {
            id: row[0],
            eventId: row[1],
            authorId: row[2],
            time: row[3],
            content: row[4],
            replyingToId: row[5],
        }]
    ));


    return ids.map((id) => messageMap.get(id) ?? null)
 
}


export async function getUser(id: number, context: GraphQLContext) {


    const query = `
        SELECT 
            DisplayName,
            Role,
            Bio
        FROM Users
        WHERE id=$1
    `

    const result = await connection.query(query, { params: [id] });

    if (!result.rows) {
        console.error("Error for query: \n" + query)
        throw new GraphQLError("Internal server error")
    }

    if (result.rows.length != 1) {
        return null
    }

    const user = result.rows[0];

    return {
        id: id,
        displayName: user[0],
        role: user[1],
        bio: user[2]
    };
}

export async function getUsers(ids: readonly number[]) {
    const query = `
        SELECT
            Id,
            DisplayName,
            Role,
            Bio
        FROM Users
        WHERE id=ANY($1)
    `
    const result = await connection.query(query, { params: [ids] });

    if (!result.rows) {
        console.error("Error for query: \n" + query)
        throw new GraphQLError("Internal server error")
    }

    const userMap = new Map(result.rows.map((row) =>
        [row[0], {
            id: row[0],
            displayName: row[1],
            role: row[2],
            bio: row[3]
        }]
    ));


    return ids.map((id) => userMap.get(id) ?? null)

}



/**
 * Get the number of people that are going to, interested in, and organizers of an event. Will return 0 for all fields if the queried event does not exist.
 * @param id Event id
 * @
 * @todo Maybe this should return null if the event doesn't exist rather than 0 for everything.
 * @returns 
 */
export async function getEventStats(id: number) {
    
    const query = `
        SELECT 
            Role, 
            COUNT(*)
        FROM UserEventRoles
        WHERE eventId=$1
        GROUP BY Role
    `
    const result = await connection.query(query, { params: [id] });

    if (!result.rows) {
        console.error("Error for query: \n" + query)
        throw new GraphQLError("Internal server error")
    }

    
    const stats = {
        going: 0,
        interested:0,
        organizer:0,
        // if there are none of a certain type then the row won't show up in the query result.
        // therefore overwrite default values of 0
        ...Object.fromEntries(result.rows)
    }

    return {
        goingCount: stats.going,
        interestedCount: stats.interested,
        organizerCount: stats.organizer
    }


}


export async function getEventIdsOrganizedByUser(userId: number) {
    
    const query = `
        SELECT eventId
        FROM UserEventRoles
        WHERE userid=$1
        AND role='organizer'
    `
    const result = await connection.query(query, { params: [userId] });

    if (!result.rows) {
        console.error("Error for query: \n" + query)
        throw new GraphQLError("Internal server error")
    }
    
    return result.rows.map((row) => row[0]);
}

export async function getNumEventsOrganizedByUser(userId: number) : Promise<number> {

    const query = `
        SELECT count(*)
        FROM UserEventRoles
        WHERE userid=$1
        AND role='organizer'
    `

    const result = await connection.query(query, { params: [userId] });

    if (!result.rows) {
        console.error("Error for query: \n" + query)
        throw new GraphQLError("Internal server error")
    }

    return result.rows[0][0]
}

