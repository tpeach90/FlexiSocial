import { YogaInitialContext } from 'graphql-yoga'
// import { PrismaClient, User } from '@prisma/client'
import { authenticateUser } from './auth'
import { User, UserEventRole } from './types'
import DataLoader from 'dataloader'
import { getChatMessages, getEvents, getUserEventRoles, getUsers } from './queries'

export type GraphQLContext = {
    // currentUser: null | User,
    eventLoader: DataLoader<number, any, number>,
    chatMessageLoader: DataLoader<number, any, number>,
    userLoader: DataLoader<number, any, number>
    userEventRoleLoader: DataLoader<any, any, any>


}


export async function createContext(initialContext: YogaInitialContext): Promise<GraphQLContext> {
    return {
        // currentUser: await authenticateUser(initialContext.request, getUsers()),
        eventLoader: new DataLoader(getEvents),
        chatMessageLoader: new DataLoader(getChatMessages),
        userLoader: new DataLoader(getUsers),
        userEventRoleLoader: new DataLoader(getUserEventRoles /*, {
            cacheKeyFn: ({userId, eventId}) => `${userId}_${eventId}`
        }*/)
    }
}