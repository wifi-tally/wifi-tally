#!/bin/bash -eux

RELEASE_DIR="./dist"
NEXT_DIR="./.next"
BUILD_NAME=${BUILD_NAME:=$(git describe --tags --always)}
BUILD_NAME=${BUILD_NAME/#v/} # remove the leading "v" in the version

rm -rf "$RELEASE_DIR" "$NEXT_DIR"

mkdir "$RELEASE_DIR"

npm run build:client
npm run build:server

cp -r "$NEXT_DIR" "$RELEASE_DIR"
if [ -f "next.config.js" ]; then cp "next.config.js" "$RELEASE_DIR"; fi

# copy a cleaned up package.json
# remove package.json configuration that is not necessary for production anyways
JQ_FILTER='del(.devDependencies, .jest)'
# only leave the "start" script. Anything else would not work in production anyways
JQ_FILTER+=' | .scripts = (.scripts | to_entries | map(select(.key == "start")) | from_entries)'
# set the version
JQ_FILTER+=" | .version=\"${BUILD_NAME}\""
jq "$JQ_FILTER" package.json > "$RELEASE_DIR/package.json"
cp package-lock.json "$RELEASE_DIR/package-lock.json"

cd "$RELEASE_DIR"
npm ci --only=production --no-fund

