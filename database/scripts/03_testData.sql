


DO $$

    DECLARE johnsId integer;
    DECLARE joesId integer;
    DECLARE phoebesID integer;
    DECLARE jamirsId integer;

    DECLARE pubMeetupID integer;

    DECLARE joesQuestionId integer;
    DECLARE johnsResponseId integer;

    DECLARE johnsPfpImageId integer;

    BEGIN

        -- create some users.
        INSERT INTO Users(DisplayName, Role, Email, HashedPassword, Bio, RegisterTimestamp)
        VALUES (
            'Jeff Doe', 
            'moderator', 
            'john.doe@hotmail.com', 
            '$2a$10$WJbaHUiqn5v4OE5EkI.vjOqKOUTl24lPA7/n6C7gtxgOdVz3TTSqy', -- thisisahashedpassword
            E'Hi, I''m Jeff, I like to go to more casual events, like the ones one my website:\nhttps://www.taylorswift.com/\n\nInstagram: [@taylorswift](https://www.instagram.com/taylorswift/)\nTwitter: [@taylorswift13](https://twitter.com/taylorswift13)', 
            '2023-6-16 17:51:23'
        )
        RETURNING Id INTO johnsId;

        INSERT INTO Users(DisplayName, Role, Email, HashedPassword, Bio, RegisterTimestamp)
        VALUES (
            'Joe Bloggs', 
            'standard', 
            'joe.bloggs@gmail.com', 
            '$2a$10$b7JO5C75njndZENUPZkr6.ZTleuplP2ieyPYrDXug/mCrngEOcg/C', --Joebloggs123!
            E'We **won''t** get along unless you''ve seen _Star Wars_. If not, looking at the plot summary on Wikipedia is good enough. *May the force be with you!*\n\nSnapchat: [joedoesnotbloggs8](https://www.snapchat.com/add/joedoesnotbloggs8)', 
            '2023-12-21 06:15:18'
            )
        RETURNING Id INTO joesId;

        INSERT INTO Users(DisplayName, Role, Email, HashedPassword, Bio, RegisterTimestamp)
        VALUES (
            'Phoebe Pace', 
            'standard', 
            'phoebepace@btinternet.com', 
            '$2a$10$zFhmtVtI8SgX0xFNLl2uv.rSTLr84x68CfaI0QJdazoN3Xa7ZAOCO',  --Phoebeftw!
            'I do a good isopod impression 💯', 
            '2021-12-21 06:15:18'
        )
        RETURNING Id INTO phoebesID;

        INSERT INTO Users(DisplayName, Role, Email, HashedPassword, RegisterTimestamp)
        VALUES (
            'Jamir Ochoa', 
            'standard', 
            'jamirwochoa@whitehouse.gov', 
            '$2a$10$cl6GwDby5PoMOu2Vk6moqegKK8IkjVGzQpz6PPuFuTyOrqKHS8Fkm', -- password
            '2004-04-02 06:15:18'
        )
        RETURNING Id INTO jamirsId;

        -- John Doe creates an event
        INSERT INTO Events(Name, Description, CreatorId, Point, Location, Time, Duration, Capacity, CreatedTimestamp)
        VALUES (
            'Pub meetup', 
            E'Have a friendly meetup at a pub and do a pub quiz\nLorem ipsum dolor sit amet, consectetur adipiscing elit. Etiam pretium libero ornare iaculis eleifend. In hac habitasse platea dictumst. Proin maximus egestas convallis. Suspendisse pellentesque eleifend lacus ut condimentum. Donec ex eros, convallis ac leo a, aliquam facilisis metus. Suspendisse sit amet nunc ultricies, sodales ex congue, gravida elit. Aliquam elit nulla, vehicula nec felis nec, convallis volutpat lorem.\nDuis eleifend dignissim justo, sed dignissim urna dictum ac. Mauris posuere lectus quis imperdiet tempor. Orci varius natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Phasellus ornare nisi sit amet ex placerat, sit amet mattis ligula pretium. Nunc ac dolor id felis semper interdum. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos. Ut et tristique augue.', 
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

        -- phoebe creates an event.
        INSERT INTO Events(Name, Description, CreatorId, Point, Location, Time, Duration, Capacity, CreatedTimestamp)
        VALUES (
            'Bowling', 
            E'Come to Spalding Bowl for some bowling on Friday!\nHere''s a link to the venue''s website: https://spaldingbowl.co.uk/ \nWe''re planning to book a few lanes, if you''re interested please put a message in the chat and I''ll add you to the Messenger group chat.\nIf you don''t know what a bowling alley is, here''s the first paragraph of the [Wikipedia page](https://en.wikipedia.org/wiki/Bowling_alley):\nA *bowling alley* (also known as a *bowling center*, *bowling lounge*, *bowling arena*, or historically *bowling club*) is a facility where the sport of [bowling](https://en.wikipedia.org/wiki/Bowling) is played. It can be a dedicated facility or part of another, such as a [clubhouse](https://en.wikipedia.org/wiki/Meetinghouse) or dwelling [house](https://en.wikipedia.org/wiki/House).', 
            phoebesID, 
            ST_SetSRID(ST_MakePoint(-0.14918414519461462, 52.78942766195503),4326), 
            'Spalding Bowl',
            '2024-2-09 18:00:00+00',
            '02:00:00',
            12,
            '2024-01-12 15:45:48+00'
        );

        -- Jeff (formerly John) Doe adds a profile picture.
        -- this section should be run in a transaction as you need the generated id:
        -- =================================================================
        INSERT INTO ProfilePictureImages(StoreFilename, UploadedTimestamp)
        VALUES (
            '61fd982aa516be8f9bfc4c92014b72c7',
            '2024-01-16 14:48:52.430335'
        ) RETURNING Id INTO johnsPfpImageId;

        INSERT INTO ProfilePictures(UserId, ProfilePictureImageId)
        VALUES (
            johnsId,
            johnsPfpImageId
        );
        -- =================================================================

    END
$$;