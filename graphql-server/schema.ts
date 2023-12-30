import { compare, hash } from 'bcryptjs';
import { createSchema } from 'graphql-yoga'
import { sign } from 'jsonwebtoken';
import { readFileSync } from 'node:fs';
import { APP_SECRET } from './auth';
import { User } from './types';
import { GraphQLContext } from './context';
import { GraphQLError } from 'graphql';
import { checkEmailAndPassword, getChatMessage, getChatMessageCount, getEvent, getEventIdsInTiles, getEventIdsOrganizedByUser, getEventStats, getEvents, getNumEventsOrganizedByUser, getSensitiveUserInfo, getUser, queryChatMessages } from './sql/queries';
import { TimestampResolver, TimestampTypeDefinition } from 'graphql-scalars';
import { bboxToIntersectedTiles } from './tiles';
import { createUser } from './sql/updates';

// [] means list
//  ! means non-nullable

const typeDefs = readFileSync("typeDefs.graphql", 'utf8')

export const schema = createSchema<GraphQLContext>({
    typeDefs: [TimestampTypeDefinition, typeDefs].join("\n"),
    resolvers: {

        // some types that are not included in yoga by default.
        Timestamp: TimestampResolver,

        UserEventRole: {
            interested: "interested",
            going: "going",
            organizer: "organizer",
            none: "none"
        },

        UserRole: {
            standard: "standard",
            moderator: "moderator",
            administrator: "administrator"
        },

        Query: {
            // hello: () => 'world',
            // // user: (_, {id}, context) => users.find(user => user.id == id),
            user: (_, { id }, { userLoader }) => userLoader.load(id),
            // // me: (_, args, context: GraphQLContext) => context.currentUser,

            event: (_, { id }, { eventLoader }) => eventLoader.load(id),

            eventsInBBox: async (_, { east, west, north, south, earliest, latest, excludeTiles }, context) => {

                const tiles = bboxToIntersectedTiles({west, east, south, north});
                // filter out tiles in the user's provided exclude list
                const tilesLoaded = excludeTiles ? tiles.filter(tile => !excludeTiles.includes(tile)) : tiles;

                const eventIds = await getEventIdsInTiles(tilesLoaded, {earliest, latest});

                return {tilesLoaded, eventIds};
            },

            me: async (_, { }, { currentUserId }) => currentUserId ? getSensitiveUserInfo(currentUserId) : null // SensitiveUserInfo

        },

        SensitiveUserInfo: {
            user: async ({id}, {}, {userLoader}) => userLoader.load(id),
            
            
        },

        EventsInBBoxQueryResult: {
            events: ({eventIds}, {}, {eventLoader}) => 
                eventIds.map((id:number) => eventLoader.load(id))
            
        },

        User: {
            // __resolveReference: ({id}, {}, context) => getUser(id, context),

            eventsOrganized: async ({id}, {}, {eventLoader}) => 
                (await getEventIdsOrganizedByUser(id))
                    .map((eventId) => eventLoader.load(eventId))
            ,

            stats: ({id}, {}, context) => ({id}),
            
            roleInEvent: ({id}, {eventId}, {userEventRoleLoader}) =>
                userEventRoleLoader.load({eventId, userId: id})
            
        },

        UserStats: {
            eventsOrganizedCount: ({id}, {}, context) => getNumEventsOrganizedByUser(id) 
        },

        Event: {
            creator: ({ creatorId }, _, {userLoader}) => userLoader.load(creatorId),

            chat: (parent, _, context: GraphQLContext) => ({
                eventId: parent.id
            }),

            stats: ({id}, {}, context) => getEventStats(id)
        },

        /**
         * Required parent values: eventId
         */
        Chat: {
            event: ({eventId}, _ , {eventLoader}) => eventLoader.load(eventId),
            count: ({eventId}, _, context) => getChatMessageCount(eventId),
            messageQuery: async ({eventId}, params, context) => {
                
                const {count, hasMore, messageIds} = await queryChatMessages({ eventId , ...params})
                return {count, hasMore, messageIds}
            }
        },

        ChatQueryResult: {
            messages: ({ messageIds }, {}, {chatMessageLoader}) => 
                messageIds.map((messageId: number) => 
                    chatMessageLoader.load(messageId)
                )
        },

        ChatMessage: {
            event: ({ eventId }, { }, {eventLoader}) => eventLoader.load(eventId),
            author: ({ authorId }, { }, { userLoader }) => userLoader.load(authorId),
            reply: ({ replyingToId }, { }, { chatMessageLoader }) => 
                replyingToId != null 
                    ? chatMessageLoader.load(replyingToId) 
                    : null
        },

 
        Mutation: {

            signup: async (_, { email, password, displayName }, {}) => {
                // @todo check that the inputs are valid

                // encrypt the user's password with random salt.
                const hashedPassword = await hash(password, 10)

                // add to database
                const uuid = await createUser(displayName, email, hashedPassword);          

                // create signed token to give to the user
                // todo create a better token in the future - this is unsafe
                const token = sign({ uuid }, APP_SECRET)
                
                return { token}
            },

            login: async (_, { email, password }, {}) => {
                
                const uuid = await checkEmailAndPassword(email, password);

                if (!uuid) {
                    throw new GraphQLError("Email or password incorrect")
                }
                
                // todo create a better token in the future - this is unsafe
                const token = sign({userUuid: uuid}, APP_SECRET);

                return {token};
            }
        },


        }
    }
)




