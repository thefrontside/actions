#!/bin/sh
set -e
IFS=$'\n\t'

RED='\033[1;31m'
GREEN='\033[1;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

if [ "${#NPM_AUTH_TOKEN}" -eq "0" ]
  then
    echo -e "${RED}NPM_AUTH_TOKEN not detected. Please add your NPM Token to your repository's secrets.${NC}"
  else 
    version="`node -e \"console.log(require('./package.json').version)\"`"
    package="`node -e \"console.log(require('./package.json').name)\"`"
    if [[ $(echo $(npm view $package@$version)) ]] 
      then
        echo -e "${YELLOW}Version $version of this package already exists. To publish the changes of this commit, you must update package version in the JSON file of your project.${NC}"
      else
        git remote set-url origin https://${GITHUB_TOKEN}:x-oauth-basic@github.com/${GITHUB_REPOSITORY}.git
        git fetch origin +refs/heads/*:refs/heads/*

        branch="${GITHUB_REF#*refs\/heads\/}"
        git checkout $branch

        git config user.email "$GITHUB_ACTOR@users.noreply.github.com"
        git config user.name "$GITHUB_ACTOR"
        
        git tag --force "v$version"
        git push --force  --tags "https://$GITHUB_ACTOR:$GITHUB_TOKEN@github.com/$GITHUB_REPOSITORY.git"

        echo "//registry.npmjs.org/:_authToken=$NPM_AUTH_TOKEN" > ~/.npmrc
        npm config set unsafe-perm true
        npm install
        npm publish --access=public
        
        echo -e "${GREEN}Tagged and published version v${version} successfully!${NC}"
    fi
fi