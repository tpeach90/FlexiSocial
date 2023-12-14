import { compare, hash } from 'bcryptjs';
import { createSchema } from 'graphql-yoga'
import { sign } from 'jsonwebtoken';
import { readFileSync } from 'node:fs';
import { APP_SECRET } from './auth';
import { User } from './types';
import { GraphQLContext } from './context';
import { GraphQLError } from 'graphql';
import { getChatMessage, getChatMessageCount, getEvent, getEventStats, getUser, queryChatMessages } from './queries';
import { TimestampResolver, TimestampTypeDefinition } from 'graphql-scalars';

// [] means list
//  ! means non-nullable

const typeDefs = readFileSync("typeDefs.graphql", 'utf8')

// the "database"
var users = [] as User[];
export function getUsers() {return users};


export const schema = createSchema<GraphQLContext>({
    typeDefs: [TimestampTypeDefinition, typeDefs].join("\n"),
    resolvers: {

        // some types that are not included in yoga by default.
        Timestamp: TimestampResolver,

        // this converts the enum into something we can test against, I think.
        YearsUnit: {
            HUMAN_YEARS: 'HUMAN_YEARS',
            DOG_YEARS: 'DOG_YEARS',
        },

        Query: {
            hello: () => 'world',
            // user: (_, {id}, context) => users.find(user => user.id == id),
            user: (_, {id}, context) => getUser(id, context),
            me: (_, args, context: GraphQLContext) => context.currentUser,

            event: (_, {id}, context) => getEvent(id)
        },

        Event: {
            // this needs to return a user object.
            creator: (parent, _, context: GraphQLContext) => {
                // the id of the creator is parent.creatorId
                // todo if only the id is requested from the user then we don't need to make a second query to the database.
                return getUser(parent.creatorId, context);

            },

            chat: (parent, _, context: GraphQLContext) => ({
                eventId: parent.id
            }),

            stats: ({id}, {}, context) => getEventStats(id)
        },

        /**
         * Required parent values: eventId
         */
        Chat: {
            event: ({eventId}, _ , context) => getEvent(eventId),
            count: ({eventId}, _, context) => getChatMessageCount(eventId),
            messageQuery: async ({eventId}, params, context) => {
                
                const {count, hasMore, messageIds} = await queryChatMessages({ eventId , ...params})
                return {count, hasMore, messageIds}
            }
        },

        ChatQueryResult: {
            messages: ({ messageIds }, {}, context) => 
                messageIds.map((messageId: number) => 
                    getChatMessage(messageId)
                )
        },

        ChatMessage: {
            event: ({eventId}, {}, context) => getEvent(eventId),
            author: ({authorId}, {}, context) => getUser(authorId, context),
            reply: ({ replyingToId }, { }, context) => 
                replyingToId != null 
                    ? getChatMessage(replyingToId) 
                    : null
        },

 
        Mutation: {
            async signup(
                parent: unknown,
                args: {
                    email: string,
                    password: string,
                    name: string,
                    age: number
                },
                context: GraphQLContext  
            ) {
                // encrypt the user's password.
                const password = await hash(args.password, 10)

                // store the new user in the database.
                // const user = await context.prisma.user.create({
                //     data: { ...args, password }
                // })
                
                // Tom: here just add them to the users data structure for now.
                // create a new ID:
                var id = 0;
                while (id.toString() in users) id++;
                // add user
                const user = {
                    age: args.age,
                    name: args.name,
                    password: password,
                    email: args.email,
                    id: id.toString()
                }
                // users.push(user);


                // 3
                const token = sign({ userId: id }, APP_SECRET)

                // 4
                return { token, user }
            },

            // async login(parent: unknown, args:{email: string, password: string /*unhashed password*/ }, context: GraphQLContext) {

            //     // look for the user with matching email
            //     const user = users.find(user => user.email == args.email);


            //     // compare hashed passwords
            //     if (!user || ! await compare(args.password, user.password))
            //         throw new GraphQLError("Username or password incorrect")
            
            //     const token = sign({userID: user.id}, APP_SECRET);

            //     return {token, user};
            // }
        },

        // User: {
        //     age: (parent, args, context) => {
        //         switch (args.unit) {
        //             case "DOG_YEARS":
        //                 return parent.age * 7
        //             case "HUMAN_YEARS":
        //                 return parent.age
        //         }
        //     }
        // }
    }
})




