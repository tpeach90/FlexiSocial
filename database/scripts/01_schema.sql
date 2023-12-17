
-- run using::
-- \i schema.sql
-- or if that doesn't work just copy paste straight into the terminal

DROP TABLE IF EXISTS Users CASCADE;
DROP TABLE IF EXISTS Events CASCADE;
DROP TABLE IF EXISTS ChatMessages CASCADE;
DROP TABLE IF EXISTS UserEventRoles CASCADE;
DROP TABLE IF EXISTS ChatReplies CASCADE;
DROP TYPE IF EXISTS USER_ROLE;
DROP TYPE IF EXISTS USER_EVENT_ROLE;
DROP EXTENSION IF EXISTS postgis;

CREATE EXTENSION postgis;

CREATE TYPE USER_ROLE AS ENUM ('standard', 'moderator', 'administrator');

CREATE TYPE USER_EVENT_ROLE AS ENUM ('interested', 'going', 'organizer');



CREATE TABLE Users (
    Id integer primary key generated always as identity,
    DisplayName varchar(255) NOT NULL,
    Role USER_ROLE NOT NULL,
    Bio varchar(8000),
    Email varchar(255) NOT NULL,
    HashedPassword varchar(255) NOT NULL
);

CREATE TABLE Events (
    Id integer primary key generated always as identity,
    Name varchar(255) NOT NULL,
    Description varchar(8000) NOT NULL,
    CreatorId integer NOT NULL, -- this is different to the organizer role. just used to keep track of the single account that created the event, and it is not normally displayed to people browsing the app.
    -- SRID 4326 means latitude/longitude pair.
    Point geometry(Point,4326) NOT NULL,
    Location varchar(255) NOT NULL,
    Time timestamp with time zone NOT NULL,
    Duration interval NOT NULL,
    Capacity numeric CHECK (Capacity > 0),

    FOREIGN KEY (CreatorId) REFERENCES Users(Id)
);

-- Keeps track of which users are 'interested', 'going', or 'organizer's of events.
CREATE TABLE UserEventRoles (
    UserId integer NOT NULL,
    EventId integer NOT NULL,
    Role USER_EVENT_ROLE NOT NULL,

    PRIMARY KEY (UserId, EventId),
    FOREIGN KEY (UserId) REFERENCES Users(Id),
    FOREIGN KEY (EventId) REFERENCES Events(Id)
);





CREATE TABLE ChatMessages (
    Id integer primary key generated always as identity,

    EventId integer NOT NULL,
    AuthorId integer NOT NULL,
    Time timestamp WITHOUT TIME ZONE  NOT NULL, -- maybe add "with time stamp" ?
    Content VARCHAR(1000) NOT NULL, -- note, need to check that it doesn't exceed the length

    FOREIGN KEY (EventId) REFERENCES Events(Id),
    FOREIGN KEY (AuthorId) REFERENCES Users(Id)
);

-- 
CREATE TABLE ChatReplies (
    MessageId integer primary key NOT NULL,
    ReplyingToId integer, -- if this is null it means that the message has been deleted.

    FOREIGN KEY (MessageId) REFERENCES ChatMessages(Id),
    FOREIGN KEY (ReplyingToId) REFERENCES ChatMessages(Id)
);


