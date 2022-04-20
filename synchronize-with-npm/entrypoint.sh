#!/usr/bin/env bash
set -e

RED='\033[1;31m'
GREEN='\033[1;32m'
YELLOW='\033[1;33m'
BLUE='\033[1;34m'
NC='\033[0m'

function git_setup(){
  git config --global --add safe.directory /github/workspace
  git remote set-url origin https://x-oauth-basic:${GITHUB_TOKEN}@github.com/${GITHUB_REPOSITORY}.git
  git fetch origin +refs/heads/*:refs/heads/*

  branch="${GITHUB_REF#*refs\/heads\/}"
  git checkout $branch

  git config user.email "$GITHUB_ACTOR@users.noreply.github.com"
  git config user.name "$GITHUB_ACTOR"
}

function find_packages(){
  function filter_ignores(){
    function unslash_end(){
      for to_unslash in $*; do
        echo $to_unslash | sed 's:\/$::g';
      done;
    }

    defaults=("node_modules" ".github")
    skip_directories=($(unslash_end $INPUT_IGNORE) ${defaults[@]})
    for skip_directory in ${skip_directories[@]}; do
      for i in ${!all_package_jsons[@]}; do
        if [ $(echo "${all_package_jsons[$i]}" | sed -E "s:^$skip_directory.*::") ]; then
          :
        else
          echo -e "${RED}Removing ${YELLOW}${all_package_jsons[$i]} ${RED}because of ${YELLOW}${skip_directory}${NC}"
          unset all_package_jsons[$i]
        fi
      done
    done
  }

  function format_get_directory(){
    for to_format in $*; do 
      if [ "$(echo $to_format | grep -c "/")" = "0" ]; then 
        echo ".";
      else 
        echo $(echo $to_format | sed 's:\(.*\)\/.*:\1:g');
      fi;
    done;
  }
  
  all_package_jsons=($(find . -name 'package.json' -not -path '**/node_modules/**' | sed 's/^.\///g'))
  filter_ignores

  for i in ${all_package_jsons[@]}; do
    echo $i
  done;

  for i in ${!all_package_jsons[@]}; do
    pkg_name=$(jq .name ${all_package_jsons[$i]} | sed 's/^"//g;s/"$//g');
    pkg_ver=$(jq .version ${all_package_jsons[$i]} | sed 's/^"//g;s/"$//g');
    pkg_private=$(jq '.private' ${all_package_jsons[$i]});
    if [ "$pkg_private" = "true" ]; then
      echo -e "${RED}Skipping publishing process for: ${YELLOW}$pkg_name${RED} because package is marked as private and therefore not intended to be published.${NC}";
      unset all_package_jsons[$i];
    elif [ "$pkg_ver" == "null" ]; then
      echo -e "${RED}Skipping publishing process for: ${YELLOW}$pkg_name${RED} because there is no version specified in the package's package.json file${NC}";
      unset all_package_jsons[$i];
    elif $(echo $(npm search $pkg_name) | grep -q -v 'No matches found'); then
      if [ "$(npm view $pkg_name@$pkg_ver)" ]; then
        echo -e "${RED}Version ${YELLOW}$pkg_ver${RED} of ${YELLOW}$pkg_name${RED} already exists.${NC}";
        echo -e "${BLUE}Tip:${YELLOW}To publish the changes of this commit, you must update package version in the package.json file.${NC}";
        unset all_package_jsons[$i];
      fi
    fi
  done;

  validated_directories=($(echo $(format_get_directory ${all_package_jsons[@]}) | xargs -n1 | sort -u | xargs))
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
      npm publish --access=public
    else
      $INPUT_NPM_PUBLISH --access=public
    fi
  }

  echo "//registry.npmjs.org/:_authToken=$NPM_TOKEN" >> ~/.npmrc
  echo "unsafe-perm=true" >> ~/.npmrc

  install_with_CLI

  if [ "${#INPUT_BEFORE_ALL}" -ne "0" ]; then
    echo -e "${RED}Runnning before_all: ${YELLOW}$INPUT_BEFORE_ALL${RED}${NC}"
    $INPUT_BEFORE_ALL
  fi

  for package in ${validated_directories[@]}; do
    cd $GITHUB_WORKSPACE/$package

    package_name="`node -e \"console.log(require('./package.json').name)\"`"
    version="`node -e \"console.log(require('./package.json').version)\"`"
    echo -e "${GREEN}Running publishing process for: ${YELLOW}$package_name${NC}"

    publish_command
    git tag $package_name-v$version
    git push origin $package_name-v$version
    echo -e "${GREEN}Successfully published version ${BLUE}${version}${GREEN} of ${BLUE}${package_name}${GREEN}!${NC}"

    cd $GITHUB_WORKSPACE
  done
}

function deprecate(){
  pkg_jsons_for_deprecate=($(find . -name 'package.json' -not -path '**/node_modules/**'))
  
  for i in ${pkg_jsons_for_deprecate[@]}; do
    if [ "$(jq .deprecate $i)" != "null" ]; then
      deprecate_name=$(jq .name $i | sed 's/^"//g;s/"$//g');
      deprecate_description=$(jq .deprecate $i);
      echo -e "${RED}Deprecating${YELLOW} ${deprecate_name}${RED}...${NC}"
      npm deprecate $deprecate_name $deprecate_description
      echo -e "${GREEN}Deprecation of ${deprecate_name} complete.${NC}"
    fi
  done;
}

git_setup
find_packages
publish
deprecate
