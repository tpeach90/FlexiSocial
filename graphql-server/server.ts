import { createServer } from 'node:http'
import { createSchema, createYoga } from 'graphql-yoga'
import { schema } from './schema'
import { createContext } from "./context"
import { connection } from './connection'

// Create a Yoga instance with a GraphQL schema.
const yoga = createYoga({ schema, context: createContext})

// Pass it into a server to hook into request handlers.
const server = createServer(yoga)

// get database connection
connection.connect()
.then(() => {
    console.log("Got database connection")

    // start server
    server.listen(4000, () => {
        console.info('Server is running on http://localhost:4000/graphql')
    })
})

