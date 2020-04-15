#!/usr/bin/env bash
set -e

RED='\033[1;31m'
GREEN='\033[1;32m'
YELLOW='\033[1;33m'
BLUE='\033[1;34m'
NC='\033[0m'

function git_setup(){
  git remote set-url origin https://${GITHUB_TOKEN}:x-oauth-basic@github.com/${GITHUB_REPOSITORY}.git
  git fetch origin +refs/heads/*:refs/heads/*

  branch="${GITHUB_REF#*refs\/heads\/}"
  git checkout $branch

  git config user.email "$GITHUB_ACTOR@users.noreply.github.com"
  git config user.name "$GITHUB_ACTOR"
}

function get_directories(){
  function format_dit_giff(){
    for to_format in $*; do 
      if [ "$(echo $to_format | grep -c "/")" = "0" ]; then 
        echo ".";
      else 
        echo $(echo $to_format | sed 's:\(.*\)\/.*:\1:g');
      fi;
    done;
  }

  function unslash_end(){
    for to_unslash in $*; do
      echo $to_unslash | sed 's:\/$::g';
    done;
  }

  function json_locater(){
    echo -e "${GREEN}Running json_locator for: ${YELLOW}$1${NC}"
    if [ -d ${GITHUB_WORKSPACE}/$1 ]; then
      cd $GITHUB_WORKSPACE/$1        
      if [ ! -f "package.json" ]; then
        if [ "$(echo $1 | grep -c "/")" = "1" ]; then
          super_directory+=$(echo $1 | sed 's:\(.*\)\/.*:\1:g');
          json_locater $super_directory
        else
          cd $GITHUB_WORKSPACE
          json_within=($(find . -name 'package.json' -not -path './node_modules/*'));
          json_count=${#json_within[@]};
          if [ "$json_count" != "1" ]; then
            echo -e "${RED}Excluding: ${YELLOW}.${RED} because there is a sub-package.${NC}"
          else
            package_directories+=(".")
          fi
        fi
      else
        json_within=($(find . -name 'package.json' -not -path './node_modules/*'));
        json_count=${#json_within[@]};
        if [ "$json_count" != "1" ]; then
          echo -e "${RED}Excluding: ${YELLOW}$1${RED} because there is a sub-package.${NC}"
        else
          package_directories+=("$1")
        fi
      fi
      cd $GITHUB_WORKSPACE
    else
      echo -e "${RED}Skipping ${YELLOW}$1${RED} because the directory does not exist.${NC}"
    fi
  }

  function filter_ignores(){
    defaults=("node_modules" ".github")
    skip_directories=($(unslash_end $INPUT_IGNORE) ${defaults[@]})
    for skip_directory in ${skip_directories[@]}; do
      for i in ${!package_directories[@]}; do
        if [ $(echo "${package_directories[$i]}" | sed -E "s:^$skip_directory.*::") ]; then
          :
        else
          echo -e "${RED}Removing ${YELLOW}${package_directories[$i]} ${RED}because of ${YELLOW}${skip_directory}${NC}"
          unset package_directories[$i]
        fi
      done
    done
  }

  before=$(git --no-pager log --pretty=%P -n 1 $GITHUB_SHA)
  current=$GITHUB_SHA
  diff_directories=($(echo $(format_dit_giff $(git diff --name-only $before..$current)) | xargs -n1 | sort -u | xargs))
  package_directories=()

  for i in ${!diff_directories[@]}; do
    json_locater ${diff_directories[$i]}
  done

  filter_ignores

  publish_directories=($(echo ${package_directories[@]} | xargs -n1 | sort -u | xargs))
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

  function publish_command(){
    if [ "${#INPUT_NPM_PUBLISH}" = "0" ]; then
      npm publish
    else
      $INPUT_NPM_PUBLISH
    fi
  }

  echo "//registry.npmjs.org/:_authToken=$NPM_TOKEN" >> ~/.npmrc
  echo "unsafe-perm=true" >> ~/.npmrc

  install_with_CLI

  if [ "${#INPUT_BEFORE_ALL}" -ne "0" ]; then
    echo -e "${RED}Runnning before_all: ${YELLOW}$INPUT_BEFORE_ALL${RED}${NC}"
    $INPUT_BEFORE_ALL
  fi

  for package in ${publish_directories[@]}; do
    cd $GITHUB_WORKSPACE/$package

    is_private=$(echo $(jq '.private' package.json))

    if [ "$is_private" = "true" ]; then
      echo -e "${RED}Skipping publishing process for: ${YELLOW}$dir${RED} because package is marked as private and therefore not intended to be published.${NC}"
    else
      package_name="`node -e \"console.log(require('./package.json').name)\"`"
      version="`node -e \"console.log(require('./package.json').version)\"`"
      echo -e "${GREEN}Running publishing process for: ${YELLOW}$package_name${NC}"

      if [ -z "$(npm view ${package_name}@${version})" ]; then
        publish_command --access=public
        git tag $package_name-v$version
        git push origin $package_name-v$version --tags
        echo -e "${GREEN}Successfully published version ${BLUE}${version}${GREEN} of ${BLUE}${package_name}${GREEN}!${NC}"
      else
        echo -e "${RED}Version ${YELLOW}$version${RED} of ${YELLOW}$package_name${RED} already exists.${NC}"
        echo -e "${BLUE}Tip:${YELLOW}To publish the changes of this commit, you must update package version in the package.json file.${NC}"
      fi
    fi

    cd $GITHUB_WORKSPACE
  done
}

git_setup
get_directories
publish
