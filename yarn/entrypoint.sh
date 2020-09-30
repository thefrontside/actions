#!/bin/sh
set -e

RED='\033[1;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

yarn > stderr.log 2>&1
yarnoutput="$(cat stderr.log)"
echo "$yarnoutput"
warnCount="$(echo $yarnoutput | grep -c -i "warn")"

if [ $warnCount != "0" ]; then
  echo -e "${RED}ERROR:${YELLOW} Halting workflow because a warning was detected while installing...${NC}"
  exit 1
fi;
