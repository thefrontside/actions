# Synchronize NPM Tags
With the exception of `latest` and any other tag labels that are passed in as an argument, this action will remove tags from NPM that do not match any existing branch names.

## Requirements
- You must pass in your `NPM_AUTH_TOKEN` as shown below.
- Optional: Add tag names you'd like to keep as `keep` argument.

## Usage
```yaml
jobs:
  job_name:
    name: Job Name
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v1
    - uses: thefrontside/actions/synchronize-npm-tags@master
      with:
        keep: dev beta alpha
      env:
        NPM_AUTH_TOKEN: ${{ secrets.NPM_AUTH_TOKEN }}
```