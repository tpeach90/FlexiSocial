
import fs from "fs";
import path from "path";
// import { connection } from "./connection";
import {app} from "./routes";
import {STORE, port} from "./config"
import { withClient } from "./connection";


async function start() {

    console.log("The store is set to location " + path.resolve(STORE))

    // check if the store exists.
    try{
        await fs.promises.access(STORE, fs.constants.F_OK)
    } catch {
        // try to create the store.
        try {
            await fs.promises.mkdir(STORE);
        } catch (e) {
            console.error("Failed to create the store folder at " + path.resolve(STORE));
            throw e;
        }
        console.log("Created the store folder at " + path.resolve(STORE));
    }

    // check that we have permission to access the store
    try {
        await fs.promises.access(STORE, fs.constants.R_OK | fs.constants.W_OK);
    } catch (e) {
        console.error("Unable to access the store folder at " + path.resolve(STORE));
        throw e;
    }


    // // connect to database
    // try {
    //     await connection.connect();
    // } catch (e) {
    //     console.error("Failed to get database connection. Is the database running, and have credentials been supplied to this server in environment variables?")
    //     throw e;
    // }
    // console.log("Got database connection");

    // check that we have a connection to the database.

    withClient(() => console.warn("Falied to get database connection??"), client => {
        client.query("SELECT NOW()")
    })


    // start server
    app.listen(port, () => {
        console.log(`Listening on port ${port}`)
    })
}

start();