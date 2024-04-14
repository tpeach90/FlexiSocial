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
import { createEvent, createProfilePictureUploadLink, createUser, setInterestInEvent } from './sql/updates';

// [] means list
//  ! means non-nullable

const typeDefs = readFileSync("src/typeDefs.graphql", 'utf8')

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

        UserEventInterest: {
            interested: "interested",
            going: "going",
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

            eventsInBBox: async (_, { east, west, north, south, earliest, latest, excludeTiles }, {client}) => {

                const tiles = bboxToIntersectedTiles({west, east, south, north});
                // filter out tiles in the user's provided exclude list
                const tilesLoaded = excludeTiles ? tiles.filter(tile => !excludeTiles.includes(tile)) : tiles;

                const eventIds = await getEventIdsInTiles(client, tilesLoaded, {earliest, latest});

                return {tilesLoaded, eventIds};
            },

            me: async (_, { }, { userContext, client}) => {
                const id = await userContext.getId();
                return id ? await getSensitiveUserInfo(client, id) : null
            }

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

            eventsOrganized: async ({id}, {}, {eventLoader, client}) => 
                (await getEventIdsOrganizedByUser(client, id))
                    .map((eventId) => eventLoader.load(eventId))
            ,

            stats: ({id}, {}, context) => ({id}),
            
            roleInEvent: ({id}, {eventId}, {userEventRoleLoader}) =>
                userEventRoleLoader.load({eventId, userId: id}),

            profilePicture: ({ id }, { }, { userProfilePictureLoader })  => 
                userProfilePictureLoader.load(id),
            
        },

        UserStats: {
            eventsOrganizedCount: ({id}, {}, {client}) => getNumEventsOrganizedByUser(client, id) 
        },

        Event: {
            creator: ({ creatorId }, _, {userLoader}) => userLoader.load(creatorId),

            chat: (parent, _, context: GraphQLContext) => ({
                eventId: parent.id
            }),

            stats: ({id}, {}, {client}) => getEventStats(client, id)
        },

        /**
         * Required parent values: eventId
         */
        Chat: {
            event: ({eventId}, _ , {eventLoader}) => eventLoader.load(eventId),
            count: ({eventId}, {since}, {client}) =>  {

                if (since) {
                    const sinceDate = Date.parse(since);
                    if (isNaN(sinceDate)) {
                        throw new GraphQLError("`since` not in date time string format")
                    }
                    return getChatMessageCount(client, eventId, {since:new Date(sinceDate)})
                } else {
                    return getChatMessageCount(client, eventId)
                }

            },
            messageQuery: async ({eventId}, params, {client}) => {
                
                const {count, hasMore, messageIds} = await queryChatMessages(client, { eventId , ...params})
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

            signup: async (_, { email, password, displayName }, {client}) => {
                // encrypt the user's password with random salt.
                const hashedPassword = await hash(password, 10)
                
                // add to database
                // this function also checks for valid email format.
                const uuid = await createUser(client, displayName, email, hashedPassword);          

                // create signed token to give to the user
                // todo create a better token in the future - this is unsafe
                const token = sign({ uuid }, APP_SECRET)
                
                return { token}
            },

            login: async (_, { email, password }, {client}) => {
                
                const uuid = await checkEmailAndPassword(client, email, password);

                if (!uuid) {
                    throw new GraphQLError("Email or password incorrect")
                }
                
                // todo create a better token in the future - this is unsafe
                const token = sign({uuid}, APP_SECRET);

                return {token};
            },

            uploadPfp: async (_, {}, {userContext, client}) => {

                const id = await userContext.getId();

                if (!id) throw new GraphQLError("Not authorized")

                // TODO create a temporary upload link.
                const { link, expiryTimestamp } = await createProfilePictureUploadLink(client, id);

                return {link, expiryTimestamp}
                

            },

            createEvent: async(_, {name, description, latitude, longitude, location, time, duration, capacity}, {userContext, client}) => {

                const creatorId = await userContext.getId();
                if (!creatorId) throw new GraphQLError("Not authorized")

                const {eventId} = await createEvent(client, {
                    creatorId: creatorId,
                    name: name,
                    description: description,
                    point: {
                        latitude: latitude,
                        longitude: longitude
                    },
                    location: location,
                    timeString: time,
                    duration: duration,
                    capacity: capacity
                })

                return {eventId}

            },

            setInterestInEvent: async (_, {eventId, interest}, {userContext, client}) => {

                const userId = await userContext.getId();
                if (!userId) throw new GraphQLError("Not authorized")

                await setInterestInEvent(client, userId, eventId, interest)

                return {}

            }
        },


        MutationResult: {
            success: () => true
        }
    }
})




