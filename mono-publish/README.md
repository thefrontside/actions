# Mono Publish
This action will authenticate for Github Package Registry and loop over the `PACKAGES` argument to publish each package with the branch name as its tag. Once the action is done publishing, it will generate a comment (if this action is run on a pull request) with instructions on how to access each package.

## Requirements
- Pass in `GITHUB_TOKEN` for authentication
  - Currently tailored for Github Package Registry and not NPMJS
- Specify `PACKAGES` argument

## Usage
```yaml
jobs:
  job_name:
    name: Job Name
    runs-on: ubuntu-16.04
    steps:
    - uses: actions/checkout@v1
    - name: Mono Publish
      uses: thefrontside/actions/mono-publish@master
      with:
        PACKAGES: package/name packages/*
      env:
        GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```
