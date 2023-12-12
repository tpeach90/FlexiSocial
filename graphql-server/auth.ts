import { JwtPayload, verify } from "jsonwebtoken";
import { User } from "./types";

export const APP_SECRET = 'this is my secret'


export async function authenticateUser(
    request:Request,
    users: User[]
) : Promise<User | null> {
    const header = request.headers.get("authorization");
    if (header !== null) {
        // the token arrives in the header in the form:
        // Authorization: "Bearer MY_TOKEN_HERE"
        const token = header.split(" ")[1];

        // decrypts the token (??) using the APP_SECRET
        const tokenPayload = verify(token, APP_SECRET) as JwtPayload;

        // remember this is how the token was signed:
        // sign({ userId: id }, APP_SECRET)
        const userID = tokenPayload.userId;

        return users.find(user => user.id == userID) ?? null;
    }

    return null;
}