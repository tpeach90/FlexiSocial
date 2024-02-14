// @ts-nocheck

import { makeServer } from "../src/server"
import request from 'supertest-graphql'
import gql from 'graphql-tag'
import * as Queries from "../src/sql/queries";
import * as Updates from "../src/sql/updates";
import { GET_EVENT_IDS_ORGANIZED_BY_USER, GET_NUM_EVENTS_ORGANIZED_BY_USER, GET_USERS, GET_USER_ROLES_IN_EVENT } from "./mockDatabaseResponses";
import { PoolClient } from "pg";

import * as MOCK from "./mockObjects"

import * as matchers from 'jest-extended';
expect.extend(matchers);


const app = (async () => (await makeServer()).listen(4000))();

describe("users", () => {

    // need to keep the original implementation
    // going to create a mock that passes a different argument (a mock database client) to the actual
    const getUsersActual = Queries.getUsers;
    const getNumEventsOrganizedByUserActual = Queries.getNumEventsOrganizedByUser;
    const getEventIdsOrganizedByUserActual = Queries.getEventIdsOrganizedByUser;
    const getUserEventRolesActual = Queries.getUserEventRoles;

    describe("get user by id", () => {
        describe("given the user exists", () => {
            it("should return the user data", async () => {
                
                // create a mock client to return the mock database data.
                const mockClient = {
                    query: jest.fn(async (_, [ids]) => GET_USERS[0](ids))
                }
                
                jest.spyOn(Queries, "getUsers")
                    .mockImplementation(async (client, ids) => {
                        return await getUsersActual(mockClient, ids)
                    })

                const {data: d, errors} = await request(await app).query(gql`
                    query {
                        user(id: 1) {
                            id
                            displayName
                            role
                            bio
                            registerTimestamp
                        }
                    }
                `
                )
                .expectNoErrors();
                expect(Queries.getUsers).toHaveBeenCalledWith(expect.anything(), [1])
                expect(mockClient.query).toHaveBeenCalledWith(
                    expect.objectContaining({rowMode: "array"}),
                    [[1]]
                )
                
                // make typescript happy
                const data = d as any;
                
                expect(errors).toBe(undefined);
                if (errors && errors.length != 0) {
                    console.error(errors)
                }

                expect(data).not.toBe(undefined);
                expect(data?.user).not.toBe(undefined);
                expect(data.user.id).toBe(1);
                expect(data.user.displayName).toBe(MOCK.user1.displayName);
                expect(data.user.role).toBe(MOCK.user1.role);
                expect(data.user.bio).toBe(MOCK.user1.bio);
                expect(data.user.registerTimestamp).toBe(MOCK.user1.registerTimestamp);
            })
        })



        describe("given the user does not exist", () => {
            it("should return null", async () => {
                
                // database query for the userId returns no rows.
                const mockClient = {
                    query: jest.fn(async (_, [ids]) => ({rows:[]}))
                }

                jest.spyOn(Queries, "getUsers")
                    .mockImplementation((client, ids) => getUsersActual(mockClient, ids));
                
                // the request
                const { data: d, errors } = await request(await app).query(gql`
                    query {
                        user(id: 1) {
                            id
                            displayName
                            role
                            bio
                            registerTimestamp
                        }
                    }
                `
                ).expectNoErrors();
                expect(Queries.getUsers).toHaveBeenCalledWith(expect.anything(), [1])
                expect(mockClient.query).toHaveBeenCalledWith(
                    expect.objectContaining({ rowMode: "array" }),
                    [[1]]
                )

                const data = d as any;
                
                expect(errors).toBe(undefined);
                if (errors && errors.length != 0) {
                    console.error(errors)
                }
                expect(data).not.toBe(undefined);
                expect(data.user).toBe(null);
            })
        })
    })

    describe("get user stats", () => {
        it("should return the eventsOrganizedCount", async () => {

            // for the query to work we need to get the user (even though the data returned from the getUsers function is not user)
            jest.spyOn(Queries, "getUsers").mockReturnValue(new Promise((resolve) => {
                resolve([{ ...MOCK.user1 }])
            }));

            // database query returns 3
            const mockClient = {
                query: jest.fn(async (_, id) => GET_NUM_EVENTS_ORGANIZED_BY_USER[0](3))
            }
            jest.spyOn(Queries, "getNumEventsOrganizedByUser")
                .mockImplementation((client, userId) => 
                    getNumEventsOrganizedByUserActual(mockClient, userId)
                );

            const { data, errors } = await request(await app).query(gql`
                query {
                    user(id: 1) {
                        stats {
                            eventsOrganizedCount
                        }
                    }
                }
            `
            ).expectNoErrors();
            expect(Queries.getUsers).toHaveBeenCalledTimes(1);
            expect(Queries.getUsers).toHaveBeenCalledWith(expect.anything(), [1])
            expect(Queries.getNumEventsOrganizedByUser).toHaveBeenCalledTimes(1);
            expect(Queries.getNumEventsOrganizedByUser).toHaveBeenCalledWith(expect.anything(), 1);
            expect(mockClient.query).toHaveBeenCalledWith(
                expect.objectContaining({ rowMode: "array" }),
                [1]
            );
            expect(errors).toBe(undefined);
            if (errors && errors.length != 0) {
                console.error(errors)
            }
            expect(data?.user?.stats?.eventsOrganizedCount).toBe(3);
        })
    })

    describe("get events organized", () => {
        describe("given the user has organized events", () => {
            it("should return those event objects with correct ids", async () => {
                
                // user 
                const eventsOrganized = [1, 5, 62343, 35, 7323];

                // functions not being tested here return fixed objects
                jest.spyOn(Queries, "getUsers").mockImplementation(async () => {
                    return [{ ...MOCK.user1, id:1 }]
                });
                jest.spyOn(Queries, "getEvents").mockImplementation(async (_, ids) => {
                    return ids.map(id => ({...MOCK.event1, id}))
                })

                // database will return our ids
                const mockClient = {
                    query: jest.fn(async (_, _0) => GET_EVENT_IDS_ORGANIZED_BY_USER[0](eventsOrganized))
                }
                jest.spyOn(Queries, "getEventIdsOrganizedByUser")
                .mockImplementation((client, userId) => 
                    getEventIdsOrganizedByUserActual(mockClient, userId)
                );

                const { data, errors } = await request(await app).query(gql`
                    query {
                        user(id: 1) {
                            eventsOrganized {
                                id
                            }
                        }
                    }
                `
                )
                .expectNoErrors();
                expect(errors).toBe(undefined);
                expect(Queries.getUsers).toHaveBeenCalledTimes(1);
                expect(Queries.getUsers).toHaveBeenCalledWith(expect.anything(), [1]);
                expect(Queries.getEvents).toHaveBeenCalledTimes(1);
                expect(Queries.getEvents).toHaveBeenCalledWith(expect.anything(), expect.toIncludeSameMembers(eventsOrganized));
                expect(mockClient.query).toHaveBeenCalledTimes(1);
                expect(mockClient.query).toHaveBeenCalledWith(
                    expect.objectContaining({ rowMode: "array" }),
                    [1]
                );

                expect(data?.user?.eventsOrganized).toBeArray();
                expect(data.user.eventsOrganized.map(({id}) => id)).toIncludeSameMembers(eventsOrganized);
            })
        })
    })

    describe("get roleInEvent", () => {
        // TODO this really needs more testing with multiple events and users at once - the dataloaders for this are kinda complicated.

        describe("given the user has selected some role in the event (i.e. the role is not \"none\")", () => {
            it("should return that role", async () => {

                // functions not being tested here return fixed objects
                jest.spyOn(Queries, "getUsers").mockImplementation(async () => {
                    return [{ ...MOCK.user1, id: 1 }]
                });

                const mockClient = {
                    // getUserEventRoles will pass the client on to getUserRolesInEvent
                    query: jest.fn(async (_, _0) => GET_USER_ROLES_IN_EVENT[0]([1])/*interested*/)
                }
                jest.spyOn(Queries, "getUserEventRoles")
                    .mockImplementation((client, userId) =>
                        getUserEventRolesActual(mockClient, userId)
                    );



                const { data, errors } = await request(await app).query(gql`
                    query {
                        user(id: 1) {
                            roleInEvent(eventId: 1)
                        }
                    }
                `
                )
                .expectNoErrors();
                expect(errors).toBe(undefined);
                expect(Queries.getUsers).toHaveBeenCalledTimes(1);
                expect(Queries.getUsers).toHaveBeenCalledWith(expect.anything(), [1]);
                expect(Queries.getUserEventRoles).toHaveBeenCalledTimes(1);
                expect(Queries.getUserEventRoles).toHaveBeenCalledWith(expect.anything(), [{userId: 1, eventId: 1}]);
                expect(mockClient.query).toHaveBeenCalledTimes(1);
                expect(mockClient.query).toHaveBeenCalledWith(
                    expect.objectContaining({ rowMode: "array" }),
                    [1,[1]]
                );

                expect(data?.user?.roleInEvent).toBe("interested");
            })
        })
        describe("given then user's role in the event is \"none\"", () => {
            it("should return none", async () => {
                // use userid 4 - has "none" interest in event

                // functions not being tested here return fixed objects
                jest.spyOn(Queries, "getUsers").mockImplementation(async () => {
                    return [{ ...MOCK.user1, id: 4 }]
                });

                const mockClient = {
                    // getUserEventRoles will pass the client on to getUserRolesInEvent
                    query: jest.fn(async (_, _0) => GET_USER_ROLES_IN_EVENT[0]([4])/*none*/)
                }
                jest.spyOn(Queries, "getUserEventRoles")
                    .mockImplementation((client, userId) =>
                        getUserEventRolesActual(mockClient, userId)
                    );



                const { data, errors } = await request(await app).query(gql`
                    query {
                        user(id: 4) {
                            roleInEvent(eventId: 1)
                        }
                    }
                `
                )
                .expectNoErrors();
                expect(errors).toBe(undefined);
                expect(Queries.getUsers).toHaveBeenCalledTimes(1);
                expect(Queries.getUsers).toHaveBeenCalledWith(expect.anything(), [4]);
                expect(Queries.getUserEventRoles).toHaveBeenCalledTimes(1);
                expect(Queries.getUserEventRoles).toHaveBeenCalledWith(expect.anything(), [{ userId: 4, eventId: 1 }]);
                expect(mockClient.query).toHaveBeenCalledTimes(1);
                expect(mockClient.query).toHaveBeenCalledWith(
                    expect.objectContaining({ rowMode: "array" }),
                    [1, [4]]
                );

                expect(data?.user?.roleInEvent).toBe("none");
            })
        })
    })
})