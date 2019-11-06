#!/bin/sh
set -e

RED='\033[1;31m'
GREEN='\033[1;32m'
YELLOW='\033[1;33m'
NC='\033[0m'


PR="$(jq '."pull_request"' ../workflow/event.json)"
if [[ "$PR" = "null" ]]
  then
    echo -e "${RED}ERROR: We suspect this workflow was not triggered from a pull request.${NC}"
    exit 1

else
  if [[ "$GITHUB_HEAD_REF" = "latest" ]]
    then
      echo -e "${RED}ERROR: Unable to publish preview because your branch conflicts with NPM's protected 'latest' tag.${NC}"
      echo -e "${YELLOW}Please change the name of your branch and resubmit the pull request.${NC}"

cat << "EOT" > dangerfile.js
const { markdown } = require('danger');

const first_line = `:warning: WARNING :warning:`;
const second_line = `I can't publish a preview of this branch this because it would conflict with the \`latest\` tag which is [reserved by NPM](https://docs.npmjs.com/cli/dist-tag#purpose).`;

markdown(`${first_line}\n\n${second_line}`)
EOT

  else
    yarn
    npm version "`node -e \"console.log(require('./package.json').version)\"`-`git log --pretty=format:'%h' -n 1`" --no-git-tag-version
    echo "//npm.pkg.github.com/:_authToken=${GITHUB_TOKEN}" >> .npmrc
    tag="$(echo $GITHUB_HEAD_REF | sed -E 's:_:__:g;s:\/:_:g')"
    if [ "${#INPUT_NPM_PUBLISH}" -eq "0" ]
      then
        npm publish --access=public --tag $tag
      else
        $INPUT_NPM_PUBLISH --access=public --tag $tag
    fi

cat << "EOT" > dangerfile.js
const { markdown } = require('danger');
const pjson = require('./package.json');

const current = `https://www.npmjs.com/package/${pjson.name}/v/${pjson.version}`
const branch = process.env.GITHUB_HEAD_REF;
const masked = branch.replace(/\//g, '_');

const install_version = `npm install ${pjson.name}@${pjson.version}`;

const first_line = `A preview package of this pull request has been released to NPM with the tag \`${masked}\`.`;
const second_line = `You can try it out by running the following command:`;
const install_tag = `$ npm install ${pjson.name}@${masked}`;
const fourth_line = `or by updating your package.json to:`
const update_json = `\{\n  \"${pjson.name}\": \"${masked}\"\n\}`
const last_line = `Once the branch associated with this tag is deleted (usually once the PR is merged or closed), it will no longer be available. However, it currently references [${pjson.name}@${pjson.version}](${current}) which will be available to install forever.`;

markdown(`${first_line}\n${second_line}\n\`\`\`bash\n${install_tag}\n\`\`\`\n${fourth_line}\n\`\`\`bash\n${update_json}\n\`\`\`\n${last_line}`)
EOT

  fi

jsonpath="../workflow/event.json"
headurl="$(jq '."pull_request"|."head"|."repo"|."url"' $jsonpath)"
baseurl="$(jq '."pull_request"|."base"|."repo"|."url"' $jsonpath)"

  if [[ "$headurl" = "$baseurl" ]]; 
  then
    yarn global add danger --dev
    export PATH="$(yarn global bin):$PATH"
    danger ci
  else
    echo -e "${RED}Not generating a comment because this pull request was created from a forked repository.${NC}"
    echo -e "${YELLOW}Publishing preview will not work if the pull request was created from a forked repository unless you create the pull request against your own repository.${NC}"
  fi

fi