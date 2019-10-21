# NPM Publish Branch Preview
This action will publish to NPM using the current branch name as its tag.

## Requirements
- Pass in `NPM_AUTH_TOKEN`.
- This action can only be run on pull requests.
- You will get an error if your branch is named `latest`.
- Optional: `NPM_PUBLISH` argument is available if you want to run a different command. `npm publish` will run as default.

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
      with:
        NPM_PUBLISH: npm run my-script
      env: 
        NPM_AUTH_TOKEN: ${{ secrets.NPM_AUTH_TOKEN }}
```