#!/bin/bash
set -e
IFS=$'\n\t'

RED='\033[1;31m'
GREEN='\033[1;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

if [ "${#NPM_AUTH_TOKEN}" -eq "0" ]
  then 
    echo "${RED}NPM_AUTH_TOKEN not detected. This either means you forgot to add it to your secrets or this PR was created from a fork.${NC}"
    echo "${YELLOW}If you've created a pull request from a fork and would like to publish a preview, you must do so from a pull request in your own repository.${NC}"
    exit 1
  else 
    echo "${GREEN}Secrets detected and working workflow.${NC}"
fi