# Merge and Fork Detector
This action is a filter mechanism to halt workflows unless it's one of the two following scenarios:
  1. Workflow is triggered by a pull request and NPM_AUTH_TOKEN is accessible.
  2. Workflow is triggered by the commit of a pull request merge.

## Requirements
You must pass in your NPM_AUTH_TOKEN for this action to work properly.

## Usage
```yaml
jobs:
  filter:
    name: Filter by Commit Message
    runs-on: ubuntu-latest
    steps:    
    - name: Filter by Commit Message
      uses: thefrontside/actions/merge-and-fork-detector@master
      with:
        NPM_AUTH_TOKEN: ${{ secrets.NPM_AUTH_TOKEN }}
```

## Development
Since this action was built with Javascript, per the [documentation](https://help.github.com/en/articles/creating-a-javascript-action#commit-and-push-your-action-to-github), any changes made to this action must be re-compiled with `@zeit/ncc`.

In your terminal:
```bash
$ npm install
$ npm i -g @zeit/ncc
$ ncc build main.js
```
