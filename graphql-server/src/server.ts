import { createServer } from 'node:http'
import { createSchema, createYoga } from 'graphql-yoga'
import { schema } from './schema'
import { GraphQLContext, createContext, destroyContext } from "./context"
import { pool } from './connection'

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
    try {
        pool.query("SELECT NOW()")
        console.log("Got database connection")
    } catch (e) {
        console.error("Failed to get database connection.")
        throw e;
    }

    return server;
}


