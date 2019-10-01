#!/bin/bash
set -euo pipefail

git remote set-url origin https://${GITHUB_TOKEN}:x-oauth-basic@github.com/${GITHUB_REPOSITORY}.git
git fetch origin +refs/heads/*:refs/heads/*

branch="${GITHUB_REF#*refs\/heads\/}"
git checkout $branch

### outdated
# branch=$(printf "%s\n" "${GITHUB_BASE_REF#*refs\/heads\/}")
# git checkout $GITHUB_HEAD_REF


git config user.email "$GITHUB_ACTOR@users.noreply.github.com"
git config user.name "$GITHUB_ACTOR"

echo hello > test.md
# git add $INPUT_ADD
git add test.md

current="`node -e \"console.log(require('./package.json').version)\"`"
git commit -m "Release version $current"

git push "https://$GITHUB_ACTOR:$GITHUB_TOKEN@github.com/$GITHUB_REPOSITORY.git" $branch

exit 1