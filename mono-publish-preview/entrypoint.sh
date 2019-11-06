#!/usr/bin/env bash
set -e

RED='\033[1;31m'
GREEN='\033[1;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

function rundanger(){
  echo running: danger
  yarn global add danger --dev
  export PATH="$(yarn global bin):$PATH"
  danger ci
}

function publishgateway(){
  cd $GITHUB_WORKSPACE/gateways/pro-portal
  npm version "`node -e \"console.log(require('./package.json').version)\"`-`git log --pretty=format:'%h' -n 1`" --no-git-tag-version
  npm publish --tag $tag
  cd $GITHUB_WORKSPACE

cat << "EOT" > dangerfile.js
const { markdown } = require('danger');
const pjson = require('./gateways/pro-portal/package.json');

const current = `https://www.npmjs.com/package/${pjson.name}/v/${pjson.version}`
const branch = process.env.GITHUB_HEAD_REF;
const masked = branch.replace(/\//g, '_');

const install_version = `npm install ${pjson.name}@${pjson.version}`;

const first_line = `A preview package of this pull request has been released to GPR with the tag \`${masked}\`.`;
const second_line = `You can try it out by running the following command:`;
const install_tag = `$ npm install ${pjson.name}@${masked}`;
const fourth_line = `or by updating your package.json to:`
const update_json = `\{\n  \"${pjson.name}\": \"${masked}\"\n\}`

markdown(`${first_line}\n\n${second_line}\n\`\`\`bash\n${install_tag}\n\`\`\`\n${fourth_line}\n\`\`\`bash\n${update_json}\n\`\`\``)
EOT

rundanger
}

function publish(){
  echo running: publish
  if [ "${#confirmedpkgs[@]}" -eq "0" ];
    then 
cat << "EOT" > dangerfile.js
const { markdown } = require('danger');

const first_line = `:warning: NOTIFICATION :warning:`;
const second_line = `You are receiving this message because there were no packages to publish..`;

markdown(`${first_line}\n\n${second_line}`)
EOT
    else
      for dir in ${confirmedpkgs[@]}; do
        cd $dir

        pkgname="`node -e \"console.log(require('./package.json').name)\"`"
        pkgver="`node -e \"console.log(require('./package.json').version)\"`"

        npm version "`node -e \"console.log(require('./package.json').version)\"`-`git log --pretty=format:'%h' -n 1`" --no-git-tag-version

        npm publish --tag $tag
        
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

const first_line = `The packages of this pull request have been released to Github Package Registry.`;
const second_line = `Click on the following packages for instructions on how to install them:`;

markdown(`${first_line}\n${second_line}\n${packages()}`)
EOT
  fi;

  rundanger
  echo -e "${GREEBN}SUCCESS${NC}"
}

function filter(){
  echo running: filter
  diffy=(${piffy[@]})
  #fiffy=()
  for ignoree in ${ignores[@]}; do
    for i in ${!diffy[@]}; do
      if [ "${diffy[$i]}" = "." ]; then
        unset diffy[$i]
      else
        if [ $(echo "${diffy[$i]}" | sed -E "s:^$ignoree.*::") ]; then
          echo $i: skipping "${diffy[$i]}" because of $ignoree
        else
          unset diffy[$i]
        fi
      fi
    done
  done
  confirmedpkgs=($(echo "${diffy[@]}" | xargs -n1 | sort -u | xargs))

  publish
}

function findy(){
  echo running: findy
  jiffy=(${dird[@]})
  piffy=()

  function pkgjsonfinder(){
    echo -e "${GREEN}pkgjsonfinder with $1"
    cd $GITHUB_WORKSPACE
    cd $1
    if [ ! -f "package.json" ]; then
      if [ "$(echo $1 | grep -c "/")" = "1" ]; then
        sub=$(echo $1 | sed 's:\(.*\)\/.*:\1:g');
        echo -e "${RED}no pkgjson for $1 so looping with $sub"
        pkgjsonfinder $sub
      else
        echo -e "${RED}no pkgjson and last dir so ."
        piffy+=(".")
      fi
    else
      echo -e "${GREEN}pkgjson found so adding $1 to piffy"
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
  echo running: setup
  yarn install
  tag="$(echo $GITHUB_HEAD_REF | sed -E 's:_:__:g;s:\/:_:g')"
  echo '{"tag":"","packages":[]}' > published.json
  echo $(jq --arg TEST "$tag" '.tag = $TEST' published.json) > published.json
  if [ "$INPUT_RUNNY" = "zeusgateway" ]; then
    echo gateways
    publishgateway
  else
    echo not gateways
    findy
  fi
}

function runit(){
  echo running: runit
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
        echo $(echo $diff | sed 's:\(.*\)\/.*:\1:g');
      fi;
    done;
  }

  defaults=("node_modules" ".github")
  ignores=($(unslash $INPUT_IGNORE) ${defaults[@]})

  # variables for testing offline
  # diffs=$(git diff --name-only 2e5c6c9..91dd994)
  # INPUT_IGNORE="minorepo/dos/sub/ minorepo/uno/sub2/ minorepo/dos"
  # GITHUB_HEAD_REF=nolatest
  # GITHUB_WORKSPACE=~/projects/georgia # ~/../workspace 

  branch="${GITHUB_HEAD_REF#*refs\/heads\/}"
  
  git checkout $GITHUB_BASE_REF
  git checkout $GITHUB_HEAD_REF
  
  git config user.email "resideo@users.noreply.github.com"
  git config user.name "resideo"

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
        rundanger
      else
        setup
      fi
    fi
  fi
}

runit
