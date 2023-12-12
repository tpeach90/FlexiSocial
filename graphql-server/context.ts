import { YogaInitialContext } from 'graphql-yoga'
// import { PrismaClient, User } from '@prisma/client'
import { authenticateUser } from './auth'
import { User } from './types'
import { getUsers } from './schema'

export type GraphQLContext = {
    currentUser: null | User
}

export async function createContext(initialContext: YogaInitialContext): Promise<GraphQLContext> {
    return {
        currentUser: await authenticateUser(initialContext.request, getUsers())
    }
}