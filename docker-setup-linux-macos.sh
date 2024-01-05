#!/bin/bash

# switch to the directory where this script is saved.
cd "${0%/*}"

# store the filename for use in the --help
FILENAME=$0

# names of containers and images.
DATABASE_IMAGE="database-flexisocial-image"
DATABASE_CONTAINER="database-flexisocial"
GRAPHQL_SERVER_IMAGE="graphql-server-flexisocial-image"
GRAPHQL_SERVER_CONTAINER="graphql-server-flexisocial"
FLEXISOCIAL_NETWORK="flexisocial-net"


# parse command line args.
ALL=1
DATABASE=0
GRAPHQL_SERVER=0
FORCE=0
i=1;
j=$#;
while [[ $i -le $j ]] 
do
    case $1 in
        -d|--database)
            ALL=0
            DATABASE=1
            ;;
        -g|--graphql-server)
            ALL=0
            GRAPHQL_SERVER=1
            ;;
        -f|--force)
            FORCE=1
            ;;  
        -h|--help)
            echo "Usage: $FILENAME [OPTIONS...]"
            echo
            echo "  -d --database          (Re)create the database image and container."
            echo "  -g --graphql-server    (Re)create the GraphQL server image and container."
            echo "  -f --force             Don't ask for confirmation before proceeding."
            echo "  -h --help              Display this message and exit."
            echo
            echo "If no flags specify which containers to recreate, then all will be recreated."
            exit 0
            ;;
        *)
            echo "Unrecognized argument: $1. Run $FILENAME --help for usage" 1>&2
            exit 1
    esac
    shift 1
    i=$((i + 1))
done

if [[ $ALL == 1 ]]; then
    DATABASE=1
    GRAPHQL_SERVER=1
fi

# display confirmation message
if [[ $FORCE == 1 ]]; then
    start=y
else
    echo "The following images will be deleted (if they exist) and recreated:"
    [[ $DATABASE == 1 ]] &&       echo "    $DATABASE_IMAGE"
    [[ $GRAPHQL_SERVER == 1 ]] && echo "    $GRAPHQL_SERVER_IMAGE"
    echo
    echo "The following containers will be deleted (if they exist) and recreated:"
    [[ $DATABASE == 1 ]] &&       echo "    $DATABASE_CONTAINER"
    [[ $GRAPHQL_SERVER == 1 ]] && echo "    $GRAPHQL_SERVER_CONTAINER"
    echo

    read -p "Start? (y/n): " start
fi

# quit if user cancels.
if [[ $start != y ]]; then
    exit 0
fi

#######################################################################################################

# check that docker is running
if ! docker info > /dev/null; then
    echo "docker info failed. Is Docker running?" 1>&2
    exit 2
fi

# delete containers if they exist
if [[ $DATABASE == 1 ]] && docker ps -a --format "{{.Names}}" | grep $DATABASE_CONTAINER > /dev/null ; then
    echo "Deleting $DATABASE_CONTAINER container"
    docker stop $DATABASE_CONTAINER > /dev/null
    docker rm $DATABASE_CONTAINER > /dev/null
fi
if [[ $GRAPHQL_SERVER == 1 ]] && docker ps -a --format "{{.Names}}" | grep $GRAPHQL_SERVER_CONTAINER > /dev/null ; then
    echo "Deleting $GRAPHQL_SERVER_CONTAINER container"
    docker stop $GRAPHQL_SERVER_CONTAINER > /dev/null
    docker rm $GRAPHQL_SERVER_CONTAINER > /dev/null
fi

# delete images if they exist
if [[ $DATABASE == 1 ]] && docker images --format "{{.Repository}}" | grep $DATABASE_IMAGE > /dev/null; then
    echo "Deleting $DATABASE_IMAGE image"
    docker image rm $DATABASE_IMAGE > /dev/null
fi
if [[ $GRAPHQL_SERVER == 1 ]] && docker images --format "{{.Repository}}" | grep $GRAPHQL_SERVER_IMAGE > /dev/null; then
    echo "Deleting $GRAPHQL_SERVER_IMAGE  image"
    docker image rm $GRAPHQL_SERVER_IMAGE > /dev/null
fi

# create images
if [[ $DATABASE == 1 ]]; then
    echo "Creating $DATABASE_IMAGE image"
    docker build -t $DATABASE_IMAGE ./database/
fi
if [[ $GRAPHQL_SERVER == 1 ]]; then
    echo "Creating $GRAPHQL_SERVER_IMAGE image"
    docker build -t $GRAPHQL_SERVER_IMAGE ./graphql-server/
fi

# create network if not already exists
if ! docker network inspect $FLEXISOCIAL_NETWORK >/dev/null 2>&1 ; then
    echo "Creating $FLEXISOCIAL_NETWORK network"
    docker network create $FLEXISOCIAL_NETWORK > /dev/null
fi

# create containers
if [[ $DATABASE == 1 ]]; then
    echo "Creating $DATABASE_CONTAINER container"
    docker run -d -p 5432:5432 --net $FLEXISOCIAL_NETWORK --name $DATABASE_CONTAINER $DATABASE_IMAGE > /dev/null
    echo "Waiting a few seconds for the database to start..."
    sleep 5
fi
if [[ $GRAPHQL_SERVER == 1 ]]; then
    echo "Creating $GRAPHQL_SERVER_CONTAINER container"
    docker run -d -p 4000:4000 --net $FLEXISOCIAL_NETWORK --name $GRAPHQL_SERVER_CONTAINER $GRAPHQL_SERVER_IMAGE > /dev/null
fi

