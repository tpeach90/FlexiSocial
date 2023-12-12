export type UserRole = 'standard' | 'moderator' | 'administrator'

export type User = {
    id: number,
    displayName: string,
    role: UserRole
}
/**
 * duration in seconds.
 */
export type Event = {
    id: bigint,
    name: string,
    description: string,
    creatorId: bigint,
    location: string,
    lat: number,
    lon: number,
    time: Date,
    duration: number // number of seconds.,
    capacity: number
}