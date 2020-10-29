#!/bin/bash

echo "Building and copying SPA. This scripts outputs the built app into the caddy folder."
echo "This is so that the caddy container can copy the app into it's filesystem when building the container."


echo "reading .env file and add the stuff to bash environment"
if [ -f .env ]
then
  export $(cat .env | sed 's/#.*//g' | xargs)
fi

echo "running npm install"
npm --prefix ../../app install
echo "running npm build"
npm --prefix ../../app run build

cp -r ../../app/dist/spa/ ../caddy/spa/