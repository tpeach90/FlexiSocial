import express, { ErrorRequestHandler, Request, Response } from "express";
import fileUpload from 'express-fileupload';
import jimp from "jimp";
import multer from "multer";
import bodyParser, { json } from "body-parser";
import { pool, withClient } from "./connection";
import fs from "fs";
import path from "path";
import { PROFILE_PICTURE_FOLDER, STORE } from "./config";
import FileType from "file-type";
import crypto from "crypto";
import { PoolClient } from "pg";

export const app = express();


const pfpSize = [500, 500];



const errorHandler: ErrorRequestHandler = ((err, req, res, next) => {
    res.status(500);
    console.error(err);
    res.setHeader("Content-Type", "text/plain")
    res.send("Oops, something went wrong.")
});

app.use(errorHandler);

// app.use(fileUpload());

// Configure Multer for file upload
const storage = multer.memoryStorage(); // Store file in memory for processing
const upload = multer({
    storage: storage,
    limits: {fileSize: 5 * 1024**2 /* 5 mb*/}
});

app.use(bodyParser.json());



// get file
app.get("/pfps/:storeFilename", ({ params: { storeFilename } }, res, next) => 
    withClient(next, (client) =>
        getUserImage(client, storeFilename, res)
    )
);

async function getUserImage(client: PoolClient, storeFilename:string, res:Response) {

    // check that the pfp exists, also that it hasn't been soft deleted in the db.
    const query = `
        SELECT Deleted 
        FROM ProfilePictureImages
        WHERE StoreFilename = $1;
    `

    const result = await client.query(query, [storeFilename]);

    if (result.rows.length != 1) {
        res.status(404).send(); // not found
        return;
    }

    const deleted = result.rows[0].deleted as boolean;

    if (deleted) {
        res.status(404).send(); // deleted
        return;
    }

    // check that the file is in the store
    const pathToFile = path.resolve(STORE, PROFILE_PICTURE_FOLDER, storeFilename);
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







// upload file
// one file required: "pfp" - must be < 5MB, jpg or png. Must be at least 100x100 px.

// eg:
// curl -i -X POST -H "Content-Type: multipart/form-data" -F "pfp=@/home/thomas/Misc/fluffy_slime.png" http://localhost:3000/userimages/69170a21f12b4bcb58fff7e1e19270cc

// convert between fileType and Jimp stuff.
const allowedMimeTypes = ["image/png", "image/jpeg"];

app.post("/pfps/:tempLink", upload.single('pfp'), async (req, res, next) => {
    await withClient(next, (client) => 
        uploadUserProfilePicture(client, req, res)
    );
});

async function uploadUserProfilePicture(client: PoolClient, req: Request, res: Response) {


    const { params: { tempLink }} = req;

    // check that the link is valid.
    const query = `
        SELECT
            UserId,
            ExpiryTimestamp,
            current_timestamp
        FROM ProfilePictureUploadLinks
        WHERE ProfilePictureUploadLinks.Link = $1::text
    `;

    const result = await client.query(query, [tempLink]);

    if (!result.rows) {
        res.status(500).send(); // internal server error
        return;
    };

    if (result.rows.length != 1) {
        res.status(404).send(); // not found
        return;
    }
    const {
        userid,
        expirytimestamp,
        current_timestamp
    } : {
        userid: number,
        expirytimestamp: Date,
        current_timestamp: Date,
    } = result.rows[0];

    
    if (current_timestamp > expirytimestamp) {
        res.status(404).send();
        return;
    }

    // parse dims
    let dims;

    if (req.body.dims) {
        let jsonDims;
        try {
            jsonDims = JSON.parse(req.body.dims);
        } catch (e) {
            res.status(400).send("dims is not valid json")
            return;
        }

        if (req.body.dims && !(
            "left" in jsonDims
            && "top" in jsonDims
            && "size" in jsonDims
        )) {
            res.status(400).send("Either all or none of left, top, and size are required.")
            return;
        }
        if (!(
            typeof (jsonDims.left) === "number" && isFinite(jsonDims.left) &&
            typeof (jsonDims.top) === "number" && isFinite(jsonDims.top) &&
            typeof (jsonDims.size) === "number" && isFinite(jsonDims.size)
        )) {
            res.status(400).send("Dims are not numbers.")
            return;
        }

        dims = {
            left: Math.trunc(jsonDims.left),
            top: Math.trunc(jsonDims.top),
            size: Math.trunc(jsonDims.size)
        }
    }


    // check user has uploaded file.
    if (!req.file) {
        res.status(400).send("No pfp included");
        return;
    }

    // read the magic numbers to find the file type
    const fileType = await FileType.fromBuffer(req.file.buffer);

    if (!fileType || !allowedMimeTypes.includes(fileType.mime)) {
        res.status(400).send("File type not allowed.")
        return;
    }

    // attempt to parse the file
    // apparently this reads the magic numbers?
    let img;
    try {
        img = await jimp.read(req.file.buffer);
    } catch (e) {
        console.error(e);
        res.status(400).send("Malformed file");
        return;
    } 

    // get the dimensions of the uploaded image
    const width = img.getWidth();
    const height = img.getHeight();

    if (width < 100 || height < 100) {
        res.status(400).send("Image must be at least 100x100.")
    }

    // check that these are consistent with the dimensions for cropping
    // if left top and size weren't specified by the user then set them now.

    // create bbox in which we will center the area.
    if (dims) {
        // check that the dims are valid
        if (dims.size < 100) {
            res.status(400).send("Cropping bounding box size less than 100px.")
            return;
        }
        if (dims.left < 0
            || dims.left + dims.size > width
            || dims.top < 0
            || dims.top + dims.size > height) {
            res.status(400).send("Specified bounding box for cropping outside of image")
            return;
        }
    } else {
        // largest possible square, centered.
        const newSize = Math.min(width, height);
        dims = {
            left: Math.floor((width-newSize)/2),
            top: Math.floor((height-newSize)/2),
            size: newSize
        }
    }

    // crop and resize the image
    const croppedImg = img.crop(dims.left, dims.top, dims.size, dims.size)
        .resize(pfpSize[0], pfpSize[1]);

    // choose a link
    // 32 hex characters.
    var storeFilename = crypto.randomBytes(16).toString("hex");
    
    // begin a database transaction.
    // add pfp to the database and remove temp link
    // write the pfp to a file. if this fails cancel the transaction
    await client.query("BEGIN");

    try {

        // delete the old profile picture if it exists
        // this also triggers an update on the ProfilePictureImages table setting deleted=true
        const update = `
            DELETE FROM ProfilePictures
            WHERE UserId = $1;
        `;
        await client.query(update, [userid]);

        // add entry to ProfilePictureImages table
        const update1 = `
            INSERT INTO ProfilePictureImages (StoreFilename)
            VALUES ($1)
            RETURNING Id;
        `;
        const result1 = await client.query(update1, [storeFilename])

        if (!result1.rows || result.rows.length != 1) {
            throw new Error("No rows in output of query?")
        }

        const profilepictureimageid : number = result1.rows[0].id;

        // add new entry to ProfilePictures table
        const update2 = `
            INSERT INTO ProfilePictures (UserId, ProfilePictureImageId)
            VALUES ($1, $2);
        `;
        await client.query(update2, [userid, profilepictureimageid])

        // delete the temp link
        const update3 = `
            DELETE FROM ProfilePictureUploadLinks
            WHERE Link=$1;
        `
        await client.query(update3, [tempLink])

        // write the file to the store as png
        const pathToWrite = path.resolve(STORE, PROFILE_PICTURE_FOLDER, storeFilename);
        await fs.promises.writeFile(pathToWrite, await croppedImg.getBufferAsync(jimp.MIME_PNG))



        await client.query("COMMIT");


    } catch (e) {

        await client.query("ROLLBACK");

        console.error(e)
        res.status(500).send();
        return;
    }



    res.status(201).send() // created




}













