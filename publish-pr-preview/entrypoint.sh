#!/usr/bin/env bash
set -e

RED='\033[1;31m'
GREEN='\033[1;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

function run_danger(){
  yarn global add danger --dev
  export PATH="$(yarn global bin):$PATH"
  danger ci
}

function publish(){
  function install_with_CLI(){
    if [ -f "yarn.lock" ]; then
      yarn
    else
      npm config set unsafe-perm true
      npm install
    fi
  }

  function authenticate_publish(){
    if [ $INPUT_GPR = true ]; then
      echo "//npm.pkg.github.com/:_authToken=$GITHUB_TOKEN" > ~/.npmrc
    else
      echo "//registry.npmjs.org/:_authToken=$NPM_AUTH_TOKEN" > ~/.npmrc
    fi
  }

  function npm_version_SHA(){
    npm version "`node -e \"console.log(require('./package.json').version)\"`-`git log --pretty=format:'%h' -n 1`" --no-git-tag-version
  }

  tag="$(echo $GITHUB_HEAD_REF | sed -E 's:_:__:g;s:\/:_:g')"
  echo '{"tag":"","packages":[]}' > published.json
  echo $(jq --arg TEST "$tag" '.tag = $TEST' published.json) > published.json

  if [ "${#confirmed_packages[@]}" -eq "0" ]; then 
cat << "EOT" > dangerfile.js
const { markdown } = require('danger');

const first_line = `:warning: NOTIFICATION :warning:`;
const second_line = `You are receiving this message because there were no packages to publish..`;

markdown(`${first_line}\n\n${second_line}`)
EOT
  else
    install_with_CLI
    for dir in ${confirmed_packages[@]}; do
      cd $dir

      authenticate_publish
      npm_version_SHA

      if [ "${#INPUT_NPM_PUBLISH}" -eq "0" ]; then
        npm publish --access=public --tag $tag
      else
        $INPUT_NPM_PUBLISH --access=public --tag $tag
      fi
      
      pkgname="`node -e \"console.log(require('./package.json').name)\"`"
      echo $(jq --arg PKG "$pkgname" '.packages[.packages | length] |= . + {"name": $PKG}' $GITHUB_WORKSPACE/published.json) > $GITHUB_WORKSPACE/published.json
      cd $GITHUB_WORKSPACE
    done;
    if [ "${#confirmed_packages[@]}" -eq "1" ]; then
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
    else
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
  fi;
  run_danger
}

function remove_packages_to_skip(){
  function unslash_end_of_args(){
    for to_unslash in $*; do
      echo $to_unslash | sed 's:\/$::g';
    done;
  }

  defaults=("node_modules" ".github")
  skip_directories=($(unslash_end_of_args $INPUT_IGNORE) ${defaults[@]})
  package_directories_array=(${package_directories[@]})

  all_json=$(find . -name 'package.json');
  total_packages_count=${#all_json[@]};

  for skip_directory in ${skip_directories[@]}; do
    for i in ${!package_directories_array[@]}; do
      if [ "${package_directories_array[$i]}" = "." ]; then
        if [ "$total_packages_count" = "1" ]; then
          :
        else
          unset package_directories_array[$i]
        fi
      else
        if [ $(echo "${package_directories_array[$i]}" | sed -E "s:^$skip_directory.*::") ]; then
          :
        else
          unset package_directories_array[$i]
        fi
      fi
    done
  done

  confirmed_packages=($(echo "${package_directories_array[@]}" | xargs -n1 | sort -u | xargs))

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
  
  git checkout $GITHUB_BASE_REF
  git checkout $GITHUB_HEAD_REF

  diffs=$(git diff --name-only $GITHUB_BASE_REF..$GITHUB_HEAD_REF)
  diff_directories=$(format_dit_giff $diffs)
  diff_directories_array=(${diff_directories[@]})

  package_directories=()

  function json_locater(){
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
  }

  for i in ${!diff_directories_array[@]}; do 
    json_locater ${diff_directories_array[$i]}
  done;

  remove_packages_to_skip
}

function check_prerequisites(){
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
        run_danger
      elif [ "${#INPUT_GPR}" -eq "0" ] && [ "${#NPM_AUTH_TOKEN}" -eq "0" ]; then
        echo -e "${RED}ERROR: NPM_AUTH_TOKEN not detected. Please add your NPM Token to your repository's secrets.${NC}"
    
cat << "EOT" > dangerfile.js
const { markdown } = require('danger');

const first_line = `:mega: Heads up!`;
const second_line = `I didn't detect an NPM_AUTH_TOKEN which is necessary to publish a preview version of this package, and so I wasn't able to. However, this is perfectly normal for pull requests that are submitted from a forked repository, so no need to worry if that's what's going on here.`;

markdown(`${first_line}\n\n${second_line}`)
EOT
        run_danger
      else
        package_json_finder
      fi
    fi
  fi
}

check_prerequisites
