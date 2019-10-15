#!/bin/sh
set -e

RED='\033[1;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

if [ "${#NPM_AUTH_TOKEN}" -eq "0" ]
  then
    echo -e "${RED}ERROR: NPM_AUTH_TOKEN not detected. Please add your NPM Token to your repository's secrets.${NC}"
    echo -e "${YELLOW}Publishing preview will not work if the pull request was created from a forked repository unless you create the pull request against your own repository.${NC}"
    exit 1
elif [[ "$GITHUB_HEAD_REF" = "" ]]
  then
    echo -e "${RED}ERROR: We suspect this workflow was not triggered from a pull request.${NC}"
    exit 1
elif [[ "$GITHUB_HEAD_REF" = "latest" ]]
  then
    echo -e "${RED}ERROR: Unable to publish preview because your branch conflicts with NPM's protected 'latest' tag.${NC}"
    echo -e "${YELLOW}Please change the name of your branch and resubmit the pull request.${NC}"
    exit 1
else
  echo "//registry.npmjs.org/:_authToken=$NPM_AUTH_TOKEN" > ~/.npmrc
  npm config set unsafe-perm true
  npm install
  tag="$(echo $GITHUB_HEAD_REF | sed -E 's:_:__:g;s:\/:_:g')"
  npm publish --access=public --tag $tag
fi