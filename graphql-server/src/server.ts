import { createServer } from 'node:http'
import { createSchema, createYoga } from 'graphql-yoga'
import { schema } from './schema'
import { GraphQLContext, createContext, destroyContext } from "./context"
import { pool, withClient } from './connection'

export async function makeServer() {
    // Create a Yoga instance with a GraphQL schema.
    const yoga = createYoga({
        schema, 
        context: createContext,
        plugins: [
            {
                onResponse: ({serverContext}) => {
                    destroyContext(serverContext as GraphQLContext);
                }
                // () {
                //     destroyContext(serverContext)
                // }
            }
        ]
    })

    // Pass it into a server to hook into request handlers.
    const server = createServer(yoga)

    // check that we have a connection to the database.
    withClient(client => client.query("SELECT NOW()"))
        .then(() => console.log(("Got database connection")))
        .catch(() => console.warn("Failed to get database connection? Maybe it's still starting."))

    return server;
}


