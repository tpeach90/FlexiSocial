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
        throw new GraphQLError("Event not found")
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
        throw new Error("No chat message with id " + id);
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


export async function getUser(id: number, context: GraphQLContext): Promise<User | null> {


    const query = `
        SELECT 
            DisplayName,
            Role
        FROM Users
        WHERE id=$1
    `

    const result = await connection.query(query, { params: [id] });

    if (!result.rows) {
        console.error("Error for query: \n" + query)
        throw new GraphQLError("Internal server error")
    }

    if (result.rows.length != 1) {
        throw new GraphQLError("User not found")
    }

    const user = result.rows[0];

    return {
        id: id,
        displayName: user[0],
        role: user[1]
    };
}