


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
        INSERT INTO Users(DisplayName, Role, Email, HashedPassword)
        VALUES ('John Doe', 'standard', 'john.doe@hotmail.com', 'pretendthisisahashedpassword')
        RETURNING Id INTO johnsId;

        INSERT INTO Users(DisplayName, Role, Email, HashedPassword)
        VALUES ('Joe Bloggs', 'standard', 'joe.bloggs@gmail.com', 'Joebloggs123!')
        RETURNING Id INTO joesId;

        INSERT INTO Users(DisplayName, Role, Email, HashedPassword)
        VALUES ('Phoebe Pace', 'standard', 'phoebepace@btinternet.com', 'Phoebeftw!')
        RETURNING Id INTO phoebesID;

        INSERT INTO Users(DisplayName, Role, Email, HashedPassword)
        VALUES ('Jamir Ochoa', 'standard', 'jamirwochoa@whitehouse.gov', 'password')
        RETURNING Id INTO jamirsId;

        -- John Doe creates an event
        INSERT INTO Events(Name, Description, CreatorId, Point, Location, Time, Duration, Capacity)
        VALUES (
            'Pub meetup', 
            'Have a friendly meetup at a pub and do a pub quiz', 
            johnsId, 
            ST_SetSRID(ST_MakePoint(52.78767525040571, -0.15334250560616502),4326), -- Pied Calf in Spalding
            'The Pied Calf, Spalding',
            '2023-12-16 19:00:00+00',
            '03:00:00',
            10
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
            'I can''t wait! Does anyone want to meet up before it starts?'
        );


    END
$$;