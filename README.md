# Flexisocial

Event based social media app.

## Parts of the application

Below is an outline of the application technology stack.

+ PostgreSQL database, making use of the PostGIS extension for storing geographical data.
+ GraphGL Yoga server.
+ React Native app/front end. Using React Redux for state management and Apollo Client for contacting the graphQL server.

Typescript is the language used for the server and app.

## How to install and run

Clone this repository onto your machine (or download and unpack the zip file).

```bash
git clone https://github.com/tpeach90/FlexiSocial.git
```

### Database

Recommended way to use the database is with [Docker Desktop](https://www.docker.com/products/docker-desktop/).

Change directory to *./database/*:
```bash
cd database
```

Build the image:
```bash
docker build -t flexisocial-database .
```

Create and run the container. 

> ℹ️ **_NOTE:_**  
> If you plan on using Docker for the GraphQL server as well (not recommended), you will need to create a network so the database and server can communicate. This can be achieved with the command:
> ```bash
> docker network create flexisocial-net
> ```
> You will then need to add `--net flexisocial-net` to all `docker run` commands.

```bash
docker run -d -p 5432:5432 --name database flexisocial-database
```
You should now be able to start and stop the "database" container within Docker Desktop.

### GraphQL server

Below is the instructions to run directly on your machine. There is also a Dockerfile for the Graphql server, but this is not recommended.

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

> ℹ️ **_NOTE:_** 
> This will result in an error if the database is not running or the environment variables are not set properly.

```bash
npm start
```
### App

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

For the emulator to have access to the graphql server, you need to expose the port 4000:
```bash
adb reverse tcp:4000 tcp:4000
```


