#!/bin/bash



file="./.env"
if [ ! -f "$file" ]
then
    echo "the file .env file not found. Please provide one so we can have nice configured behaviour. Have a look at example.env for reference"
    exit
fi


echo 'starting docker service'
sudo service docker start

docker-compose up --build $1