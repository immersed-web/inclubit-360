#!/bin/bash

echo "Building and copying SPA. This scripts outputs the built app into the caddy folder."
echo "This is so that the caddy container can copy the app into it's filesystem when building the container."
echo ""

# echo "reading .env file and add the stuff to bash environment"
# if [ -f .env ]
# then
#   export $(cat .env | sed 's/#.*//g' | xargs)
# fi

# printenv > .env.dev

# echo "copying .env to app folder so variables get injected into the built app"
# cp .env ../../app/.env

echo "reading .env file and copies relevant variables"
# grep -vE "(ADMIN_USER|ADMIN_PASSWORD)" .env > ../../app/.env
grep -B 9999999 "BACKEND_ONLY_VARIABLES" .env > ../../app/.env

echo "running npm install"
npm --prefix ../../app install
echo "running npm build"
npm --prefix ../../app run build

# echo "removing previous build"
# rm -r ../caddy/dist/

# echo "copy new build into folder ../caddy/dist/"
# cp -r ../../app/dist/ ../caddy/dist/