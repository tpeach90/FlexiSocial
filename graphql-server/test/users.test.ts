import { makeServer } from "../src/server"
import request from 'supertest-graphql'
import gql from 'graphql-tag'
import supertest from "supertest-graphql";

const app = makeServer();


describe("users", () => {
    describe("get user by id", () => {
        describe("given the user exists", () => {
            it("should return the user data", async () => {


                const {data} = await supertest(app).query(gql`
                    query Q {
                        user(id: 1) {
                            id
                            displayName
                            role
                            bio
                            eventsOrganized
                            stats
                            registerTimestamp
                            roleInEvent(eventId:1)
                            profilePicture
                        }
                    }
                `
                )
                .expectNoErrors();

                expect(true).toBe(true);
            })
        })
    })
})