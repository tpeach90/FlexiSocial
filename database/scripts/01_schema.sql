
-- run using::
-- \i schema.sql
-- or if that doesn't work just copy paste straight into the terminal

DROP TABLE IF EXISTS Users CASCADE;
DROP TABLE IF EXISTS Events CASCADE;
DROP TABLE IF EXISTS ChatMessages CASCADE;
DROP TABLE IF EXISTS UserEventRoles CASCADE;
DROP TABLE IF EXISTS ChatReplies CASCADE;
DROP TABLE IF EXISTS Files CASCADE;
DROP TABLE IF EXISTS ProfilePictures CASCADE;
DROP TRIGGER IF EXISTS on_profile_picture_delete_trigger ON ProfilePictures;
DROP FUNCTION IF EXISTS on_profile_picture_delete;
DROP TYPE IF EXISTS USER_ROLE;
DROP TYPE IF EXISTS USER_EVENT_ROLE;
DROP EXTENSION IF EXISTS postgis;

CREATE EXTENSION postgis;

CREATE TYPE USER_ROLE AS ENUM ('standard', 'moderator', 'administrator');

CREATE TYPE USER_EVENT_ROLE AS ENUM ('interested', 'going', 'organizer');



CREATE TABLE Users (
    Id integer primary key generated always as identity,
    -- uuid is randomly generated.
    Uuid uuid UNIQUE NOT NULL DEFAULT gen_random_uuid(),
    DisplayName varchar(255) NOT NULL,
    Role USER_ROLE NOT NULL DEFAULT 'standard',
    Bio varchar(8000),
    RegisterTimestamp timestamp NOT NULL DEFAULT current_timestamp,
    Email varchar(255) UNIQUE NOT NULL,
    HashedPassword varchar(255) NOT NULL

);

CREATE TABLE Events (
    Id integer primary key generated always as identity,
    Name varchar(255) NOT NULL,
    Description varchar(8000) NOT NULL,
    CreatorId integer, -- this is different to the organizer role. just used to keep track of the single account that created the event, and it is not normally displayed to people browsing the app.
    -- SRID 4326 means latitude/longitude pair.
    Point geometry(Point,4326) NOT NULL,
    Location varchar(255) NOT NULL,
    Time timestamp with time zone NOT NULL,
    CreatedTimestamp timestamp NOT NULL DEFAULT current_timestamp,
    Duration interval NOT NULL,
    Capacity numeric CHECK (Capacity > 0),

    FOREIGN KEY (CreatorId) REFERENCES Users(Id) ON DELETE SET NULL
);

-- Keeps track of which users are 'interested', 'going', or 'organizer's of events.
CREATE TABLE UserEventRoles (
    UserId integer NOT NULL,
    EventId integer NOT NULL,
    Role USER_EVENT_ROLE NOT NULL,

    PRIMARY KEY (UserId, EventId),
    FOREIGN KEY (UserId) REFERENCES Users(Id) ON DELETE CASCADE,
    FOREIGN KEY (EventId) REFERENCES Events(Id) ON DELETE CASCADE
);

CREATE TABLE ChatMessages (
    Id integer primary key generated always as identity,

    EventId integer NOT NULL,
    AuthorId integer NOT NULL,
    Time timestamp WITHOUT TIME ZONE  NOT NULL DEFAULT current_timestamp, -- maybe add "with time stamp" ?
    Content VARCHAR(1000) NOT NULL, -- note, need to check that it doesn't exceed the length

    FOREIGN KEY (EventId) REFERENCES Events(Id) ON DELETE CASCADE,
    FOREIGN KEY (AuthorId) REFERENCES Users(Id) ON DELETE CASCADE
);

-- 
CREATE TABLE ChatReplies (
    MessageId integer primary key NOT NULL,
    ReplyingToId integer, -- if this is null it means that the message has been deleted.

    FOREIGN KEY (MessageId) REFERENCES ChatMessages(Id) ON DELETE CASCADE,
    FOREIGN KEY (ReplyingToId) REFERENCES ChatMessages(Id) ON DELETE CASCADE
);

CREATE TABLE Files (
    Id integer primary key generated always as identity,
    UploadedTimestamp timestamp NOT NULL DEFAULT current_timestamp,
    FlaggedForDeletion boolean NOT NULL,
    OriginalFilename varchar(255) NOT NULL,
    StoreFilename char(32) UNIQUE NOT NULL
);

CREATE TABLE ProfilePictures (
    UserId integer NOT NULL,
    FileId integer NOT NULL,

    PRIMARY KEY (UserId),
    FOREIGN KEY (UserId) REFERENCES Users(Id) ON DELETE CASCADE,
    FOREIGN KEY (FileId) REFERENCES Files(Id) ON DELETE CASCADE
);


-- flag the image for deletion when ProfilePictures entry is deleted.
CREATE OR REPLACE FUNCTION on_profile_picture_delete()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE Files
    SET FlaggedForDeletion = TRUE
    WHERE Id = OLD.FileId;
    RETURN OLD;
END;
$$ LANGUAGE plpgsql;
CREATE OR REPLACE TRIGGER on_profile_picture_delete_trigger
BEFORE DELETE ON ProfilePictures
FOR EACH ROW
EXECUTE FUNCTION on_profile_picture_delete();




-- -- adapted from chatgpt.
-- -- Replace the userid with null on some tables
-- CREATE OR REPLACE FUNCTION on_user_delete()
-- RETURNS TRIGGER AS $$
-- BEGIN
--     UPDATE Files
--     SET UserId = NULL
--     WHERE UserId = OLD.Id;

--     UPDATE Events
--     SET CreatorId = NULL
--     WHERE CreatorId = OLD.Id;

--     RETURN OLD;
-- END;
-- $$ LANGUAGE plpgsql;

-- -- Create a trigger to call the function when a user is deleted
-- CREATE OR REPLACE TRIGGER on_user_delete_trigger
-- BEFORE DELETE ON Users
-- FOR EACH ROW
-- EXECUTE FUNCTION on_user_delete();


