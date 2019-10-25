#!/bin/sh
set -e

RED='\033[1;31m'
GREEN='\033[1;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

if [ "${#INPUT_PACKAGES}" -eq "0" ]
  then
    echo -e "${RED}No packages argument detected.${NC}"
    
cat << "EOT" > dangerfile.js
const { markdown } = require('danger');

const first_line = `:warning: WARNING :warning:`;
const second_line = `No \`packages\` argument was passed in therefore this action does not know which packages to publish. Please refer to this action's [README](https://github.com/thefrontside/actions/blob/master/mono-publish/README.md) on how to use it to its full potential.`;

markdown(`${first_line}\n\n${second_line}`)
EOT

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
    # yarn install-with-bin-links
    yarn install
    tag="$(echo $GITHUB_HEAD_REF | sed -E 's:_:__:g;s:\/:_:g')"
    echo '{"tag":"","packages":[]}' > published.json
    echo $(jq --arg TEST "$tag" '.tag = $TEST' published.json) > published.json
    
    for directory in $INPUT_PACKAGES; do
      package=$(find $directory -type d -maxdepth 0)
      if [ -z $package ]
        then 
          echo -e "${YELLOW}Skipping $directory because it is not a directory.${NC}"
        else 
          cd $package
          if [ -f "package.json" ]
            then
              echo "//npm.pkg.github.com/:_authToken=${GITHUB_TOKEN}" >> .npmrc
              pkgname="`node -e \"console.log(require('./package.json').name)\"`"
              pkgver="`node -e \"console.log(require('./package.json').version)\"`"
              if [ -z $GITHUB_HEAD_REF ]
                then
                  echo Not a pull request. 
                  echo Presumably merges. 
                  echo WIP?
                  # if [ -z "$(npm view $pkgname@$pkgver)" ]
                  #   then
                  #     npm publish
                  #   else
                  #     echo -e "${YELLOW}Version $pkgver of $pkgname already exists. To publish the changes of this commit, you must update package version in the JSON file of your project.${NC}"
                  # fi
                else
                  # pull requests
                  npm version "`node -e \"console.log(require('./package.json').version)\"`-`git log --pretty=format:'%h' -n 1`" --no-git-tag-version
                  npm publish --tag $tag

                  echo $(jq --arg PKG "$pkgname" '.packages[.packages | length] |= . + {"name": $PKG}' ~/../workspace/published.json) > ~/../workspace/published.json
              fi
            else 
              echo -e "${YELLOW}Skipping because there is no package.json in $directory.${NC}"
          fi
          cd ~/../workspace
      fi
    done

cat << "EOT" > dangerfile.js
const { markdown } = require('danger');
const pjson = require('./published.json');

function packages(){
  let stringy = "";
  pjson.packages.map(x=>{
    stringy += package(x.name, x.version)
  })
  return stringy;
}

function package(name, body){
  const first_line = `Install using the following command:`
  const install_tag = `$ npm install ${name}@${pjson.tag}`
  const or_line = `Or update your package.json file:`
  const json_line = `\"${name}\": \"${pjson.tag}\"`

  return `<details><summary>${name}</summary>
  
  ---
  ${first_line}
  
  \`\`\`bash
  ${install_tag}
  \`\`\`
  ${or_line}
  
  \`\`\`bash
  {
    ${json_line}
  }
  \`\`\`
  
  ---
  </details>`
}

const first_line = `The packages of this pull request has been released to Github Package Registry.`;
const second_line = `Click on the following packages for instructions on how to install them:`;

markdown(`${first_line}\n${second_line}\n${packages()}`)
EOT

  fi
fi

if [ -z $GITHUB_HEAD_REF ]
  then
    echo "Not generating comment because this is not a pull request."
else
  yarn global add danger --dev
  export PATH="$(yarn global bin):$PATH"
  danger ci
fi
