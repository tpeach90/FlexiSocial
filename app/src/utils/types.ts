export type ScreenStackOptions = "app" | "auth" | "loading" | "debug"

export type UserEventRole = 'interested' | 'going' |'organizer' | "none"

export type UserRole = 'standard' | 'moderator' | 'administrator';

export type UserInfo = {
    name: string,
    age: string,
}
