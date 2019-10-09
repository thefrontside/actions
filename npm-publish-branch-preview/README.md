# NPM Publish Branch Preview
This action will publish to NPM using the current branch name as its tag.

## Requirements
- You must pass in your `NPM_AUTH_TOKEN` as shown below.
- This action can only be run on pull requests.
- You will get an error if your branch is named 'latest'.

## Usage
```yaml
on:
  pull_request
  
jobs:
  job_name:
    name: Job Name
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v1
    - name: NPM Publish
      uses: thefrontside/actions/npm-publish-branch-preview@master
      env: 
        NPM_AUTH_TOKEN: ${{ secrets.NPM_AUTH_TOKEN }}
```