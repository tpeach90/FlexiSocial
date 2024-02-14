@echo off

echo This script will delete (if they exist) and then recreate the docker containers and images for the database, graphql server, and file server.
set /p ok="Start? (y/n): "

if %ok%==y (

    @REM check that docker is running
    docker ps >NUL || exit 1

    @REM delete containers if they exist
    docker ps -a --format "table {{.Names}}" | findstr "database-flexisocial" >NUL && (
echo Deleting database-flexisocial container &^
docker stop database-flexisocial >NUL &^
docker rm database-flexisocial >NUL
    )

    docker ps -a --format "table {{.Names}}" | findstr "graphql-server-flexisocial" >NUL && (
echo Deleting graphql-server-flexisocial container &^
docker stop graphql-server-flexisocial >NUL &^
docker rm graphql-server-flexisocial >NUL
    )

    docker ps -a --format "table {{.Names}}" | findstr "file-server-flexisocial" >NUL && (
echo Deleting file-server-flexisocial container &^
docker stop file-server-flexisocial >NUL &^
docker rm file-server-flexisocial >NUL
    )


    @REM delete images if they exist
    docker images --format "table {{.Repository}}" | findstr "database-flexisocial-image" >NUL && (
echo Deleting database-flexisocial-image image &^
docker image rm database-flexisocial-image >NUL
    )

    docker images --format "table {{.Repository}}" | findstr "graphql-server-flexisocial-image" >NUL && (
echo Deleting graphql-server-flexisocial-image image &^
docker image rm graphql-server-flexisocial-image >NUL
    )

    docker images --format "table {{.Repository}}" | findstr "file-server-flexisocial-image" >NUL && (
echo Deleting file-server-flexisocial-image image &^
docker image rm file-server-flexisocial-image >NUL
    )

    REM create images
    echo Creating database-flexisocial-image image
    docker build -t database-flexisocial-image ./database/

    echo Creating graphql-server-flexisocial-image image
    docker build -t graphql-server-flexisocial-image ./graphql-server/

    echo Creating file-server-flexisocial-image image
    docker build -t file-server-flexisocial-image ./file-server/

    @REM create network if not already exists
    docker network inspect flexisocial-net >NUL 2>&1 || (
echo Creating flexisocial-net network &^
docker network create flexisocial-net >NUL
    )

    @REM create containers
    echo Creating database-flexisocial container
    docker run -d -p 5432:5432 --net flexisocial-net --name database-flexisocial        database-flexisocial-image          >NUL
    echo Waiting a few seconds for the database to start...
    timeout 5
    echo Creating graphql-server-flexisocial container
    docker run -d -p 4000:4000 --net flexisocial-net --name graphql-server-flexisocial  graphql-server-flexisocial-image    >NUL
    echo Creating file-server-flexisocial container
    docker run -d -p 3000:3000 --net flexisocial-net --name file-server-flexisocial  file-server-flexisocial-image    >NUL


)