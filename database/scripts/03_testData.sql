


DO $$

    DECLARE johnsId integer;
    DECLARE joesId integer;
    DECLARE phoebesID integer;
    DECLARE jamirsId integer;

    DECLARE pubMeetupID integer;

    DECLARE joesQuestionId integer;
    DECLARE johnsResponseId integer;

    BEGIN

        -- create some users.
        INSERT INTO Users(DisplayName, Role, Email, HashedPassword, Bio, RegisterTimestamp)
        VALUES ('Jeff Doe', 'moderator', 'john.doe@hotmail.com', 'pretendthisisahashedpassword', E'Hi, I''m Jeff, I like to go to more casual events, like the ones one my website:\nhttps://www.taylorswift.com/\n\nInstagram: [@taylorswift](https://www.instagram.com/taylorswift/)\nTwitter: [@taylorswift13](https://twitter.com/taylorswift13)', '2023-6-16 17:51:23')
        RETURNING Id INTO johnsId;

        INSERT INTO Users(DisplayName, Role, Email, HashedPassword, Bio, RegisterTimestamp)
        VALUES ('Joe Bloggs', 'standard', 'joe.bloggs@gmail.com', 'Joebloggs123!', E'We **won''t** get along unless you''ve seen _Star Wars_. If not, looking at the plot summary on Wikipedia is good enough. *May the force be with you!*\n\nSnapchat: [joedoesnotbloggs8](https://www.snapchat.com/add/joedoesnotbloggs8)', '2023-12-21 06:15:18')
        RETURNING Id INTO joesId;

        INSERT INTO Users(DisplayName, Role, Email, HashedPassword, Bio, RegisterTimestamp)
        VALUES ('Phoebe Pace', 'standard', 'phoebepace@btinternet.com', 'Phoebeftw!', 'I do a good isopod impression 💯', '2021-12-21 06:15:18')
        RETURNING Id INTO phoebesID;

        INSERT INTO Users(DisplayName, Role, Email, HashedPassword, RegisterTimestamp)
        VALUES ('Jamir Ochoa', 'standard', 'jamirwochoa@whitehouse.gov', 'password', '2004-04-02 06:15:18')
        RETURNING Id INTO jamirsId;

        -- John Doe creates an event
        INSERT INTO Events(Name, Description, CreatorId, Point, Location, Time, Duration, Capacity, CreatedTimestamp)
        VALUES (
            'Pub meetup', 
            'Have a friendly meetup at a pub and do a pub quiz', 
            johnsId, 
            ST_SetSRID(ST_MakePoint(-0.15334250560616502, 52.78767525040571),4326), -- Pied Calf in Spalding
            'The Pied Calf, Spalding',
            '2024-1-16 19:00:00+00',
            '03:00:00',
            10,
            '2023-12-27 21:44:23+00'
        ) RETURNING Id INTO pubMeetupID;

        -- John Doe is made an organizer of this event
        -- this should happen automatically when the event is created.
        INSERT INTO UserEventRoles(UserId, EventId, Role)
        VALUES (
            johnsId,
            pubMeetupID,
            'organizer'
        );

        -- other users express varying levels of interest in the event
        INSERT INTO UserEventRoles(UserId, EventId, Role)
        VALUES (
            joesId,
            pubMeetupID,
            'interested'
        );
        INSERT INTO UserEventRoles(UserId, EventId, Role)
        VALUES (
            phoebesID,
            pubMeetupID,
            'going'
        );
        INSERT INTO UserEventRoles(UserId, EventId, Role)
        VALUES (
            jamirsId,
            pubMeetupID,
            'interested'
        );


        -- Users make chat messages about the event
        INSERT INTO ChatMessages(EventId, AuthorId, Time, Content)
        VALUES (
            pubMeetupID,
            joesId,
            '2023-12-04 15:35:42+00',
            'Hi, I just have a question, quisque vulputate, libero in congue cursus, felis mi dapibus sem, sed tincidunt nibh tellus nec ex?'
        ) RETURNING Id INTO joesQuestionId;
        INSERT INTO ChatMessages(EventId, AuthorId, Time, Content)
        VALUES (
            pubMeetupID,
            johnsId,
            '2023-12-04 15:42:21+00',
            'Yes, this shouldn''t be a problem.'
        ) RETURNING Id INTO johnsResponseId;
        -- this message is a reply to a previous one.
        INSERT INTO ChatReplies(MessageId, ReplyingToId)
        VALUES (
            johnsResponseId,
            joesQuestionId
        );
        INSERT INTO ChatMessages(EventId, AuthorId, Time, Content)
        VALUES (
            pubMeetupID,
            phoebesID,
            '2023-12-04 16:13:21+00',
            'I can''t _wait_! Does anyone want to meet up before it starts?'
        );


    END
$$;