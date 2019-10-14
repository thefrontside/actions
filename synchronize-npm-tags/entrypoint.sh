#!/bin/sh
set -e
IFS=$'\n\t' #required for checking tag against user argument

RED='\033[1;31m'
GREEN='\033[1;32m'
YELLOW='\033[1;33m'
BLUE='\033[1;34m'
NC='\033[0m'

package="`node -e \"console.log(require('./package.json').name)\"`";
input_keep_encoded="$(echo $INPUT_KEEP | sed -E 's/\_/\_\_/g;s/\//\_/g')"
branches="$(git ls-remote --heads origin  | sed 's?.*refs/heads/??')";
branches_encoded="$(echo $branches | sed -E 's/\_/\_\_/g;s/\//\_/g')";
npmtags=$(npm dist-tag ls | sed 's/\:.*//');

for tag in $npmtags; do
  if [[ "$tag" = "latest" ]] || [[ $(echo "$input_keep_encoded" | grep -e "$tag") ]]
    then
      echo -e "${GREEN}Keeping tag, ${YELLOW}$tag${GREEN}, because it is protected.${NC}"
  elif [[ $(echo $branches_encoded | grep -e "$tag") ]]
    then
      echo -e "${GREEN}Keeping tag, ${YELLOW}$tag${GREEN}, because we found a matching branch.${NC}"
  else
    echo "//registry.npmjs.org/:_authToken=$NPM_AUTH_TOKEN" > ~/.npmrc
    npm dist-tag rm $package $tag
    echo -e "${RED}Removed tag, ${YELLOW}$tag${RED} from NPM because it did not match any existing branches.${NC}"
  fi
done