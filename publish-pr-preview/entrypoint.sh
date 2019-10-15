#!/bin/sh
set -e
IFS=$'\n\t'

RED='\033[1;31m'
GREEN='\033[1;32m'
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
  npm version "`node -e \"console.log(require('./package.json').version)\"`-`git log --pretty=format:'%h' -n 1`" --no-git-tag-version
  echo "//registry.npmjs.org/:_authToken=$NPM_AUTH_TOKEN" > ~/.npmrc
  npm publish --access=public --tag $GITHUB_HEAD_REF
cat << "EOT" > dangerfile.js
const { markdown } = require('danger');
const pjson = require('./package.json');

const current = `https://www.npmjs.com/package/${pjson.name}/v/${pjson.version}`


const first_line = `This PR is available to use:`
const install_version = `npm install ${pjson.name}@${pjson.version}`;
const install_tag = `npm install ${pjson.name}@${process.env.GITHUB_HEAD_REF}`;
const last_line = `You can view the NPM package [here](${current}).`

markdown(`${first_line}\n\`\`\`bash\n${install_version}\n\`\`\`\nor\n\`\`\`bash\n${install_tag}\n\`\`\`\n${last_line}`)
EOT
  yarn global add danger --dev
  export PATH="$(yarn global bin):$PATH"
  danger ci
fi
