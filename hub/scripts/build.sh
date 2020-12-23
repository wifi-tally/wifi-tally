#!/bin/bash -eux

RELEASE_DIR="./dist"
REACT_DIR="./build"
BUILD_NAME=${BUILD_NAME:=$(git describe --tags --always)}
BUILD_NAME=${BUILD_NAME/#v/} # remove the leading "v" in the version

# ###
#
# PREPARE
#
# ###

rm -rf "$RELEASE_DIR" "$REACT_DIR"
mkdir "$RELEASE_DIR"

# ###
# 
# BUILD FRONTEND / CLIENT
# 
# ###


# "CI=false": We don't want to have the build fail on warnings
# @see https://github.com/facebook/create-react-app/issues/3657#issuecomment-354797029
CI=false npm run build:frontend
# react-scripts has the "build" directory hard-coded. So we need to move it
cp -r "$REACT_DIR" "$RELEASE_DIR/frontend-static"

# ###
#
# BUILD BACKEND / SERVER
#
# ###

npm run build:backend

NPM_START="node server.js --env=production"
# copy a cleaned up package.json
JQ_FILTER="{name: .name, private: .private, version: \"${BUILD_NAME}\", dependencies: .dependencies, scripts: {start: \"${NPM_START}\"}}"
jq "$JQ_FILTER" package.json > "$RELEASE_DIR/package.json"
cp package-lock.json "$RELEASE_DIR/package-lock.json"

cd "$RELEASE_DIR"
npm ci --only=production --no-fund

