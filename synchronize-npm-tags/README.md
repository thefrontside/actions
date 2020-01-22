# Synchronize NPM Tags
With the exception of `latest` and any other tag labels that are passed in as arguments, this action will remove tags from NPM that do not match any existing branch names.

## Requirements
- Pass in `NPM_AUTH_TOKEN`.
- Optional: You can specify any NPM tags you'd like to `preserve`.

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
        preserve: dev beta alpha
      env:
        NPM_AUTH_TOKEN: ${{ secrets.NPM_AUTH_TOKEN }}
```
