import { YogaInitialContext } from 'graphql-yoga'
// import { PrismaClient, User } from '@prisma/client'
import { authenticateUser } from './auth'
import { User, UserEventRole } from './types'
import DataLoader from 'dataloader'
import { getChatMessages, getEvents, getPfpStoreFilenames, getUserEventRoles, getUsers } from './sql/queries'
import { pool } from './connection'
import { Pool, PoolClient } from 'pg'

export type GraphQLContext = {
    // currentUser: null | User,
    eventLoader: DataLoader<number, any, number>,
    chatMessageLoader: DataLoader<number, any, number>,
    userLoader: DataLoader<number, any, number>
    userEventRoleLoader: DataLoader<any, any, any>,
    userProfilePictureLoader: DataLoader<any, any, any>,

    // currentUserId: number | null,
    userContext: UserContext,
    client: PoolClient


}

/**
 * class to cache/lazy-load the current user's id, because not every query needs to do this.
 */
class UserContext {
    
    _initialContext: YogaInitialContext;
    // null - user not signed in/invalid credentials
    // undefined - getId() has not yet been called.
    _id: number | null | undefined;
    _client:PoolClient;

    constructor (client: PoolClient, initialContext:YogaInitialContext) {
        this._initialContext = initialContext;
        this._client = client;
    }

    async getId() {
        if (this._id === undefined) {
            this._id = await authenticateUser(this._client, this._initialContext.request);
        }
        return this._id;
    }
}

export async function createContext(initialContext: YogaInitialContext): Promise<GraphQLContext> {

    const client = await pool.connect();

    return {
        // currentUser: await authenticateUser(initialContext.request, getUsers()),
        eventLoader: new DataLoader((ids) => getEvents(client, ids)),
        chatMessageLoader: new DataLoader(ids => getChatMessages(client, ids)),
        userLoader: new DataLoader(ids => getUsers(client, ids)),
        userEventRoleLoader: new DataLoader(userEvents => getUserEventRoles(client, userEvents) /*, {
            cacheKeyFn: ({userId, eventId}) => `${userId}_${eventId}`
        }*/),
        userProfilePictureLoader: new DataLoader(ids => getPfpStoreFilenames(client, ids)),
        userContext: new UserContext(client, initialContext),
        client: client
    }
}

/**
 * 
 * @param context The context, if it was created. If yoga fails to parse the query then custom context will never be created. Check any variables exist before doing anything with them!
 */
export async function destroyContext(context: Partial<GraphQLContext>) {

    context.client?.release();
}