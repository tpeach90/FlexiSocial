

echo "This script will delete (if they exist) and then recreate the docker containers and images for both the database and the graphql server."
read -p "Start? (y/n): " start

if [[ $start == "y" ]]; then

    # check that docker is running
    if ! docker info > /dev/null; then 
        exit 1
    fi

    # delete containers if they exist
    if  docker ps -a --format "table {{.Names}}" | tail -n 2 | grep "database-flexisocial" > /dev/null ; then
        echo "Deleting database-flexisocial container"
        docker stop database-flexisocial > /dev/null
        docker rm database-flexisocial > /dev/null
    fi
    if docker ps -a --format "table {{.Names}}" | tail -n 2 | grep "graphql-server-flexisocial" > /dev/null ; then
        echo "Deleting graphql-server-flexisocial container"
        docker stop graphql-server-flexisocial > /dev/null
        docker rm graphql-server-flexisocial > /dev/null
    fi

    # delete images if they exist
    if docker images --format "table {{.Repository}}" | tail -n 2 | grep "database-flexisocial-image" > /dev/null; then
        echo "Deleting database-flexisocial-image image"
        docker image rm database-flexisocial-image > /dev/null
    fi
    if docker images --format "table {{.Repository}}" | tail -n 2 | grep "graphql-server-flexisocial-image" > /dev/null; then
        echo "Deleting graphql-server-flexisocial-image  image"
        docker image rm graphql-server-flexisocial-image > /dev/null
    fi

    # create images
    echo "Creating database-flexisocial-image image"
    docker build -t database-flexisocial-image ./database/

    echo "Creating graphql-server-flexisocial-image image"
    docker build -t graphql-server-flexisocial-image ./graphql-server/

    # create network if not already exists
    if ! docker network inspect flexisocial-net >/dev/null 2>&1 ; then
        echo "Creating flexisocial-net network"
        docker network create flexisocial-net > /dev/null
    fi

    # create containers
    echo "Creating database-flexisocial container"
    docker run -d -p 5432:5432 --net flexisocial-net --name database-flexisocial        database-flexisocial-image          > /dev/null
    echo "Waiting a few seconds for the database to start..."
    sleep 5
    echo "Creating graphql-server-flexisocial container"
    docker run -d -p 4000:4000 --net flexisocial-net --name graphql-server-flexisocial  graphql-server-flexisocial-image    > /dev/null


fi