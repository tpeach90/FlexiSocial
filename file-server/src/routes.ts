import express, { ErrorRequestHandler, Response } from "express";
import { connection } from "./connection";
import fs from "fs";
import path from "path";
import { STORE } from "./config";
export const app = express();


// get file
app.get("/userimages/:tempLink", async ({ params: { tempLink } }, res, next) => {
    try {
        await getUserImage(tempLink, res);
    } catch (e) {
        console.log(e);
        next();
    }
});

async function getUserImage(tempLink:string, res:Response) {
    // get the actual filename from the database + metadata.
    const query = `
        SELECT
            UploadedTimestamp,
            Deleted,
            OriginalFilename,
            StoreFilename,
            ExpiryTimestamp,
            current_timestamp
        FROM UserImages
        RIGHT JOIN UserImageLinks
        ON UserImageLinks.UserImageId = UserImages.Id 
        WHERE UserImageLinks.Link = $1
    `;

    const result = await connection.query(query, { params: [tempLink] });

    if (!result.rows) {
        res.status(500).send(); // internal server error
        return;
    };

    if (result.rows?.length != 1) {
        res.status(404).send(); // not found
        return;
    }

    const [
        uploadedTimestamp,
        deleted,
        OriginalFilename,
        StoreFilename,
        ExpiryTimestamp,
        current_timestamp
    ]: [number, boolean, string, string, number, number] = result.rows[0];

    if (deleted) {
        res.status(404).send();
        return;
    }

    if (current_timestamp > ExpiryTimestamp) {
        res.status(404).send();
        return;
    }

    // check that the file is in the store
    const pathToFile = path.resolve(STORE, StoreFilename);
    try {
        await fs.promises.access(pathToFile, fs.constants.R_OK);
    } catch {
        res.status(500).send();
        console.error("User requests file " + pathToFile + ". It's in the database but the file doesn't exist??")
        return;
    }

    res.setHeader("Content-Type", "image/png")
    res.sendFile(pathToFile);
    return;
}



const errorHandler: ErrorRequestHandler = ((err, req, res, next) =>  {
    res.status(500);
    console.error(err);
    res.setHeader("Content-Type", "text/plain")
    res.send("Oops, something went wrong.")
});

app.use(errorHandler);