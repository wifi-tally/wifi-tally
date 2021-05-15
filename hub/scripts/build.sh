#!/bin/bash -eux

RELEASE_DIR="./dist"
REACT_DIR="./build"
BUILD_NAME=${BUILD_NAME:=$(git describe --tags --always)}
BUILD_NAME=${BUILD_NAME/#v/} # remove the leading "v" in the version

if [ -z "${CI:=""}" ]; then
  # not on CI
  PACKAGE_PRIVATE="true"
else
  PACKAGE_PRIVATE="false"
fi

# try to keep npm metadata in sync with Github Repo
if [ -z "${GITHUB_TOKEN:=""}" ]; then
  # use default values
  PACKAGE_LICENSE=""
  PACKAGE_DESCRIPTION=""
  PACKAGE_TOPICS="[]"
  PACKAGE_HOMEPAGE=""
  PACKAGE_ISSUES=""
  PACKAGE_REPO=""
else
  # when running in CI: try to determine the correct values
  PACKAGE_LICENSE=$(gh api "repos/${GITHUB_REPOSITORY}" | jq -c -r ".license.spdx_id")
  PACKAGE_DESCRIPTION=$(gh api "repos/${GITHUB_REPOSITORY}" | jq -c -r ".description")
  # @see https://github.community/t/how-to-get-the-keywords-of-a-repository-by-the-api/156445
  PACKAGE_TOPICS=$(gh api -H "Accept: application/vnd.github.mercy-preview+json" "repos/${GITHUB_REPOSITORY}" | jq -c -r ".topics")
  PACKAGE_HOMEPAGE=$(gh api "repos/${GITHUB_REPOSITORY}" | jq -c -r ".homepage")
  PACKAGE_ISSUES=$(gh api "repos/${GITHUB_REPOSITORY}" | jq -c -r ".html_url")/issues
  PACKAGE_REPO=github:$(gh api "repos/${GITHUB_REPOSITORY}" | jq -c -r ".full_name")
fi

# ###
#
# PREPARE
#
# ###

rm -rf "$RELEASE_DIR" "$REACT_DIR"
mkdir "$RELEASE_DIR"

# ###
#
# BUILD BACKEND / SERVER
#
# ###

mkdir "$RELEASE_DIR/src"
npm run build:backend -- --outDir "$RELEASE_DIR/src"

# ###
# 
# BUILD FRONTEND / CLIENT
# 
# ###


# "CI=false": We don't want to have the build fail on warnings
# @see https://github.com/facebook/create-react-app/issues/3657#issuecomment-354797029
CI=false npm run build:frontend
# react-scripts has the "build" directory hard-coded. So we need to move it
cp -r "$REACT_DIR" "$RELEASE_DIR/src/frontend"

# ###
#
# copy files
#
# ###

mkdir "$RELEASE_DIR/bin"
cp "./scripts/bin-vtally" "$RELEASE_DIR/bin/vtally"

# ###
# 
# write package.json
#
# ###

NPM_START="./bin/vtally"
# copy a cleaned up package.json
JQ_FILTER="{name: .name, version: \"${BUILD_NAME}\", description: \"${PACKAGE_DESCRIPTION}\", keywords: ${PACKAGE_TOPICS}, homepage: \"${PACKAGE_HOMEPAGE}\", bugs: \"${PACKAGE_ISSUES}\", license: \"${PACKAGE_LICENSE}\", private: ${PACKAGE_PRIVATE}, repository: \"${PACKAGE_REPO}\", engines: .engines, bin: {vtally: \"${NPM_START}\"}, dependencies: .dependencies, os: .os, cpu: .cpu}"
jq "$JQ_FILTER" package.json > "$RELEASE_DIR/package.json"
cp package-lock.json "$RELEASE_DIR/package-lock.json"

cd "$RELEASE_DIR"
# remove devDependencies from lock file
npm install --package-lock-only

