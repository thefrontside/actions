#!/usr/bin/env bash
set -e

RED='\033[1;31m'
GREEN='\033[1;32m'
YELLOW='\033[1;33m'
BLUE='\033[1;34m'
NC='\033[0m'

function run_danger(){
  echo -e "${BLUE}Installing Danger CI..${NC}"
  yarn global add danger --dev
  export PATH="$(yarn global bin):$PATH"
  echo -e "${BLUE}Running Danger CI..${NC}"
  danger ci
}

function publish(){
  function install_with_CLI(){
    if [ -f "yarn.lock" ]; then
      echo -e "${YELLOW}Installing with yarn...${NC}"
      npm_config_unsafe_perm=true yarn
    else
      echo -e "${YELLOW}Installing with npm...${NC}"
      npm_config_unsafe_perm=true npm install
    fi
  }

  function npm_version_SHA(){
    npm version "`node -e \"console.log(require('./package.json').version)\"`-`git log --pretty=format:'%h' -n 1`" --no-git-tag-version
  }

  tag="$(echo $GITHUB_HEAD_REF | sed -E 's:_:__:g;s:\/:_:g')"
  echo '{"tag":"","packages":[],"error":{"name":"","directory":""}}' > published.json
  echo $(jq --arg BRANCH "$tag" '.tag = $BRANCH' published.json) > published.json

  install_with_CLI
  echo "//registry.npmjs.org/:_authToken=${NPM_TOKEN}" >> ~/.npmrc
  
  if [ "${#INPUT_BEFORE_ALL}" -ne "0" ]; then
    echo -e "${RED}Runnning before_all: ${YELLOW}$INPUT_BEFORE_ALL${RED}${NC}"
    $INPUT_BEFORE_ALL
  fi

  for dir in ${confirmed_directories_array[@]}; do
    cd $dir

    json_within=($(find . -name 'package.json' -not -path './node_modules/*'));
    json_count=${#json_within[@]};
    is_private=$(echo $(jq '.private' package.json))

    pkgname="`node -e \"console.log(require('./package.json').name)\"`"

    if [ "$json_count" != "1" ]; then
      echo -e "${RED}Skipping publishing process for: ${YELLOW}$dir${RED} because there is a sub-package.${NC}"
    elif [ "$is_private" = "true" ]; then
      echo -e "${RED}Skipping publishing process for: ${YELLOW}$dir${RED} because package is marked as private and therefore not intended to be published.${NC}"
    else
      echo -e "${GREEN}Running publishing process for: ${YELLOW}$dir${NC}"
      npm_version_SHA

      echo -e "${GREEN}Publishing...${NC}"
      if [ "${#INPUT_NPM_PUBLISH}" -eq "0" ]; then
        npm publish --access=public --tag $tag
      else
        $INPUT_NPM_PUBLISH --access=public --tag $tag
      fi
      
      echo $(jq --arg PKG "$pkgname" '.packages[.packages | length] |= . + {"name": $PKG}' $GITHUB_WORKSPACE/published.json) > $GITHUB_WORKSPACE/published.json
    fi

    cd $GITHUB_WORKSPACE
  done;
  if [ "$(jq '."packages"|length' ./published.json)" -eq "0" ]; then
cat << "EOT" > dangerfile.js
const { markdown } = require('danger');

const first_line = `:mega: NOTIFICATION`;
const second_line = `You are receiving this message because we did not publish any packages.`;

markdown(`${first_line}\n\n${second_line}`)
EOT
  elif [ "$(jq '."packages"|length' ./published.json)" -eq "1" ]; then
cat << "EOT" > dangerfile.js
const { markdown } = require('danger');
const pjson = require('./published.json');

const branch = process.env.GITHUB_HEAD_REF;
const masked = branch.replace(/\//g, '_');

const install_version = `npm install ${pjson.packages[0].name}@${pjson.packages[0].version}`;

const first_line = `A preview package of this pull request has been published with the tag \`${masked}\`.`;
const second_line = `You can try it out by running the following command:`;
const install_tag = `$ npm install ${pjson.packages[0].name}@${masked}`;
const fourth_line = `or by updating your package.json to:`
const update_json = `\{\n  \"${pjson.packages[0].name}\": \"${masked}\"\n\}`

markdown(`${first_line}\n${second_line}\n\`\`\`bash\n${install_tag}\n\`\`\`\n${fourth_line}\n\`\`\`bash\n${update_json}\n\`\`\``)
EOT
  else
cat << "EOT" > dangerfile.js
const { markdown } = require('danger');
const pjson = require('./published.json');

let packages = pjson.packages.reduce((acc, item) => acc + package(item.name), '');

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

const first_line = `The preview packages of this pull request have been published.`;
const second_line = `Click on the following packages for instructions on how to install them:`;

markdown(`${first_line}\n${second_line}\n${packages}`)
EOT
  fi;
  run_danger
}

function remove_packages_to_skip(){
  function unslash_end_of_args(){
    for to_unslash in $*; do
      echo $to_unslash | sed 's:\/$::g';
    done;
  }

  defaults=("node_modules .github")
  skip_directories=($(unslash_end_of_args $INPUT_IGNORE) ${defaults[@]})
  confirmed_directories_array=(${confirmed_directories[@]})

  for skip_directory in ${skip_directories[@]}; do
    for i in ${!confirmed_directories_array[@]}; do
      if [ $(echo "${confirmed_directories_array[$i]}" | sed -E "s:^$skip_directory.*::") ]; then
        :
      else
        echo -e "${RED}Removing ${YELLOW}${confirmed_directories_array[$i]} ${RED}because of ${YELLOW}${skip_directory}${NC}"
        unset confirmed_directories_array[$i]
      fi
    done
  done

  publish
}

function package_json_finder(){
  function format_dit_giff(){
    for to_format in $*; do 
      if [ "$(echo $to_format | grep -c "/")" = "0" ]; then 
        echo ".";
      else 
        echo $(echo $to_format | sed 's:\(.*\)\/.*:\1:g');
      fi;
    done;
  }
  
  git config --global --add safe.directory /github/workspace
  git checkout $GITHUB_BASE_REF
  git checkout $GITHUB_HEAD_REF

  diffs=$(git diff --name-only $GITHUB_BASE_REF..$GITHUB_HEAD_REF)
  diff_directories=$(format_dit_giff $diffs)
  diff_directories_array=(${diff_directories[@]})

  echo -e "${GREEN}Directories of git-diff: ${BLUE}${diff_directories_array[@]}${NC}"

  package_directories=()

  function json_locater(){
    if [ -d "${GITHUB_WORKSPACE}/${1}" ]; then
      cd $GITHUB_WORKSPACE/$1
      if [ ! -f "package.json" ]; then
        if [ "$(echo $1 | grep -c "/")" = "1" ]; then
          super_directory=$(echo $1 | sed 's:\(.*\)\/.*:\1:g');
          json_locater $super_directory
        else
          package_directories+=(".")
        fi
      else
        package_directories+=("$1")
      fi
      cd $GITHUB_WORKSPACE
    else
      echo -e "${RED}Skipping ${YELLOW}$1${RED} because the directory does not exist.${NC}"
    fi
  }

  for i in ${!diff_directories_array[@]}; do 
    echo -e "${GREEN}Running json_locator for: ${YELLOW}${diff_directories_array[$i]}${NC}"
    json_locater ${diff_directories_array[$i]}
  done;

  package_directories_array=(${package_directories[@]})
  confirmed_directories=($(echo "${package_directories_array[@]}" | xargs -n1 | sort -u | xargs))

  remove_packages_to_skip
}

function check_prerequisites(){
  echo -e "${YELLOW}Checking prerequisites...${NC}"
  PR="$(jq '."pull_request"' ../workflow/event.json)"
  jsonpath="../workflow/event.json"
  headurl="$(jq '."pull_request"|."head"|."repo"|."url"' $jsonpath)"
  baseurl="$(jq '."pull_request"|."base"|."repo"|."url"' $jsonpath)"
  
  if [[ "$PR" = "null" ]]; then
    echo -e "${RED}Error: ${YELLOW}This action should only be called from a pull request. Please check your workflow configuration.${NC}"
  else
    if [[ "$headurl" != "$baseurl" ]]; then
      echo -e "${RED}Error: ${YELLOW}Not generating a comment because this pull request was created from a forked repository.${NC}"
      echo -e "${BLUE}Tip: ${YELLOW}Publishing preview will not work if the pull request was created from a forked repository unless you create the pull request against your own repository.${NC}"
    else
      if [[ "$GITHUB_HEAD_REF" = "latest" ]]; then
        echo -e "${RED}ERROR: ${YELLOW}Unable to publish preview because your branch conflicts with NPM's protected 'latest' tag.${NC}"
        echo -e "${BLUE}Tip: ${YELLOW}Please change the name of your branch and resubmit the pull request.${NC}"
cat << "EOT" > dangerfile.js
const { markdown } = require('danger');

const first_line = `:warning: WARNING :warning:`;
const second_line = `I can't publish a preview of this branch this because it would conflict with the \`latest\` tag which is [reserved by NPM](https://docs.npmjs.com/cli/dist-tag#purpose).`;

markdown(`${first_line}\n\n${second_line}`)
EOT
        run_danger
      else
        echo -e "${GREEN}All checks passed! Proceeding...${NC}"
        package_json_finder
      fi
    fi
  fi
}

check_prerequisites
