# Flexisocial

Event based social media app.

Creating an account | Finding events | Creating an event
:-:|:-:|:-:
![Creating an account](./docs/create_user.gif) | ![Finding events](./docs/events_on_map.gif) | ![Creating an event](./docs/create_event.gif)


## Parts of the application

Below is an outline of the application technology stack.

+ PostgreSQL database, making use of the PostGIS extension for storing geographical data.
+ GraphGL Yoga server.
+ File server (currently used only for serving and uploading user images)
+ React Native app/front end. Using React Redux for state management and Apollo Client for contacting the graphQL server.

Typescript is the language used for the servers and app.

## How to install and run

Clone this repository onto your machine (or download and unpack the zip file).

```bash
git clone https://github.com/tpeach90/FlexiSocial.git
```

Add Google Maps Platform API key to [./app/android/app/src/main/AndroidManifest.xml](/app/android/app/src/main/AndroidManifest.xml)
```xml
<meta-data
    android:name="com.google.android.geo.API_KEY"
    android:value="<YOUR API KEY>"
/>
```

The rest of this section is instructions on how to set up the parts of the stack.

> ℹ️ **_NOTE:_**  
> If you are not developing the back end, I recommend you run it using [Docker Compose](https://docs.docker.com/compose/install/).  In the root directory of this repository, run:
> ```bash
> docker compose up
> ```
> This creates and runs containers for the database, GraphQL server, and file server. You will still need to do the *App* setup as detailed later, but the rest can be skipped.

### Database

Recommended way to use the database is with [Docker](https://www.docker.com/products/docker-desktop/).

Change directory to *./database/*:
```bash
cd database
```

Build the image:
```bash
docker build -t database-flexisocial-image ./database/
```

Create and run the container. 

> ℹ️ **_NOTE:_**  
> If you plan on using Docker for the GraphQL server as well, you will need to create a network so the database and server can communicate. This can be achieved with the command:
> ```bash
> docker network create flexisocial-net
> ```
> You will then need to add `--net flexisocial-net` to all `docker run` commands.

```bash
docker run -d -p 5432:5432 --name database-flexisocial database-flexisocial-image
```
You should now be able to start and stop the "database" container within Docker Desktop.

If needed, a `psql` terminal can be opened on the database:

```bash
docker exec -it database-flexisocial psql -U flexisocial-user flexisocial
```

### GraphQL server

Below is the instructions to run directly on your machine. Alternatively there is a Dockerfile for the Graphql server.

Install [Node](https://nodejs.org/en) if not already. The LTS version is probably fine, but in case you have issues, the version used to develop this app is `v18.17.1`.

Change directory to *./graphql-server/*:
```bash
cd graphql-server
```

Install dependencies
```bash
npm install
```

To start the server, first set the following environment variables for the database:
```bash
export PGHOST=localhost \
PGPORT=5432 \
PGDATABASE=flexisocial \
PGUSER=flexisocial-user \
PGPASSWORD='cf2EM7FDz;Z`$5%' \
PGSCHEMA=public
```

Start the server.

```bash
npm start
```

### File server

Steps are the same as for the GraphQL server, except there are a couple more environment variables you need to set related to where the store is located.

```bash
cd file-server
npm install
export PGHOST=localhost \
PGPORT=5432 \
PGDATABASE=flexisocial \
PGUSER=flexisocial-user \
PGPASSWORD='cf2EM7FDz;Z`$5%' \
PGSCHEMA=public \
FLEXISOCIAL_STORE='test_store'
```

`FLEXISOCIAL_STORE='test_store'` means that the file server will use the directory `./file-server/test_store` to store user data.


To start the server:

```bash
npm start
```

### App

These instructions are currently for Android only.

Follow the below instructions to set up React Native using the React Native CLI. Again, the LTS version of Node is probably fine, but in case you experience issues, the version used to develop was `v18.17.1`.

[https://reactnative.dev/docs/environment-setup](https://reactnative.dev/docs/environment-setup)

Once compete, enter the *app* directory and install dependencies:

```bash
cd app
```

```bash
npm install
```

To run the app, in one terminal window type

```bash
npm start
```

Then in another terminal window:
```bash
npm run android
```

For the emulator to have access to the graphql server and file server, you need to expose the ports 4000 and 3000 respectively:
```bash
adb reverse tcp:4000 tcp:4000
adb reverse tcp:3000 tcp:3000
```


