#!/bin/bash
set -euo pipefail

git remote set-url origin https://${GITHUB_TOKEN}:x-oauth-basic@github.com/${GITHUB_REPOSITORY}.git
git fetch origin +refs/heads/*:refs/heads/*

echo referee: $GITHUB_REF

# branch=$(printf "%s\n" "${GITHUB_BASE_REF#*refs\/heads\/}")
# echo echoing what branch just did: $(printf "%s\n" "${GITHUB_BASE_REF#*refs\/heads\/}")

# echo before checkout: $(git branch | grep \* | cut -d ' ' -f2)
# git checkout $GITHUB_HEAD_REF
# echo current branch: $(git branch | grep \* | cut -d ' ' -f2)

exit 1

# ___ uncomment below

# git config user.email "$GITHUB_ACTOR@users.noreply.github.com"
# git config user.name "$GITHUB_ACTOR"

# git add $INPUT_ADD

# current="`node -e \"console.log(require('./package.json').version)\"`"
# git commit -m "Release version $current"
# git push "https://$GITHUB_ACTOR:$GITHUB_TOKEN@github.com/$GITHUB_REPOSITORY.git" #$branch