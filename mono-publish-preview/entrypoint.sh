#!/bin/sh
set -e

RED='\033[1;31m'
GREEN='\033[1;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

function danger(){
  yarn global add danger --dev
  export PATH="$(yarn global bin):$PATH"
  danger ci
}

function publish(){
  if [ "${#confirmedpkgs[@]}" -eq "0" ]; # change
    then 
cat << "EOT" > dangerfile.js
const { markdown } = require('danger');

const first_line = `:warning: NOTIFICATION :warning:`;
const second_line = `You are receiving this message because there were no packages to publish..`;

markdown(`${first_line}\n\n${second_line}`)
EOT
    else
      for dir in ${confirmedpkgs[@]}; do # change
        cd $dir

        echo "//npm.pkg.github.com/:_authToken=${GITHUB_TOKEN}" >> .npmrc
        npm version "`node -e \"console.log(require('./package.json').version)\"`-`git log --pretty=format:'%h' -n 1`" --no-git-tag-version
        npm publish --tag $tag
        
        pkgname="`node -e \"console.log(require('./package.json').name)\"`"
        echo $(jq --arg PKG "$pkgname" '.packages[.packages | length] |= . + {"name": $PKG}' $GITHUB_WORKSPACE/published.json) > $GITHUB_WORKSPACE/published.json

        cd $GITHUB_WORKSPACE
      done;
cat << "EOT" > dangerfile.js
const { markdown } = require('danger');
const pjson = require('./published.json');

function packages(){
  let stringy = "";
  pjson.packages.map(x=>{
    stringy += package(x.name)
  })
  return stringy;
}

function package(name){
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
  fi;

  danger
}

function filter(){
  diffy=(${piffy[@]})
  for ignoree in ${ignores[@]}; do
    for i in ${!diffy[@]}; do
      if [ -z "$(echo ${diffy[$i]} | sed "s:^$ignoree.*::")" ]; then
        unset diffy[$i]
      fi
    done
  done
  confirmedpkgs=($(echo ${diffy[@]} | xargs -n1 | sort -u | xargs))
  publish
}

function findy(){
  jiffy=(${dird[@]})
  piffy=()

  function pkgjsonfinder(){
    cd $GITHUB_WORKSPACE
    cd $1
    if [ ! -f "package.json" ]; then
      if [ "$(echo $1 | grep -c "/")" = "1" ]; then
        sub=$(echo $1 | sed 's:\(.*\)\/.*:\1:g');
        pkgjsonfinder $sub
      else
        piffy+=(".")
      fi
    else
      piffy+=("$1")
    fi
    cd $GITHUB_WORKSPACE
  }

  for i in ${!jiffy[@]}; do 
    pkgjsonfinder ${jiffy[$i]}
  done;

  filter
}

function setup(){
  yarn install
  tag="$(echo $GITHUB_HEAD_REF | sed -E 's:_:__:g;s:\/:_:g')"
  echo '{"tag":"","packages":[]}' > published.json
  echo $(jq --arg TEST "$tag" '.tag = $TEST' published.json) > published.json
  findy
}

function runit(){
  function unslash(){
    for unslash in $*; do
      echo $unslash | sed 's:\/$::g';
    done;
  }

  function diffytodir(){
    for diff in $*; do 
      if [ "$(echo $diff | grep -c "/")" = "0" ]; then 
        echo ".";
      else 
        dir_of_files_changed=$(echo $diff | sed 's:\(.*\)\/.*:\1:g');
      fi;
    done;
  }

  defaults=("node_modules" ".github")
  ignores=($(unslash $INPUT_IGNORE) ${defaults[@]})

  # placeholder variables for testing offline
  # diffs=$(git diff --name-only base..head)
  # diffs=$(git diff --name-only 6208be7..b496d63)
  # INPUT_IGNORE="minorepo/dos/sub/ minorepo/uno/sub2/ minorepo/dos"
  # GITHUB_HEAD_REF=nolatest
  # GITHUB_WORKSPACE=~/projects/georgia # ~/../workspace 

  diffs=$(git diff --name-only $GITHUB_BASE_REF..$GITHUB_HEAD_REF)
  dird=$(diffytodir $diffs)

  PR="$(jq '."pull_request"' ../workflow/event.json)"
  jsonpath="../workflow/event.json"
  headurl="$(jq '."pull_request"|."head"|."repo"|."url"' $jsonpath)"
  baseurl="$(jq '."pull_request"|."base"|."repo"|."url"' $jsonpath)"
  
  if [[ "$PR" = "null" ]]; then
    echo -e "${RED}Not generating comment because this is not a pull request.${NC}"
  else
    if [[ "$headurl" != "$baseurl" ]]; then
      echo -e "${RED}Not generating a comment because this pull request was created from a forked repository.${NC}"
      echo -e "${YELLOW}Publishing preview will not work if the pull request was created from a forked repository unless you create the pull request against your own repository.${NC}"
    else
      if [[ "$GITHUB_HEAD_REF" = "latest" ]]; then
        echo -e "${RED}ERROR: Unable to publish preview because your branch conflicts with NPM's protected 'latest' tag.${NC}"
        echo -e "${YELLOW}Please change the name of your branch and resubmit the pull request.${NC}"
cat << "EOT" > dangerfile.js
const { markdown } = require('danger');

const first_line = `:warning: WARNING :warning:`;
const second_line = `I can't publish a preview of this branch this because it would conflict with the \`latest\` tag which is [reserved by NPM](https://docs.npmjs.com/cli/dist-tag#purpose).`;

markdown(`${first_line}\n\n${second_line}`)
EOT
        danger
      else
        setup
      fi
    fi
  fi
}
