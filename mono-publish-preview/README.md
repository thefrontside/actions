# Mono Publish
This action will detect which files have been modified in the monorepo and publish the packages within the monorepo with the branch name as its tag. Once published it will generate a comment on the pull request with instructions on how to access each package.

## Requirements
- Meant to only run on a pull request
- Currently only configured for Github Package Registry and not NPMJS
- Pass in `GITHUB_TOKEN` for authentication
- Specify `IGNORE` argument for directory of packages you don't want published
  - Directories specified in `.gitignore` won't be processed to begin with so for example if you don't want to include `./node_modules` and it's already included in your `.gitignore` file then there's no point in adding it to the `IGNORE` arg in the workflow.

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
        IGNORE: . folder/example_package
      env:
        GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```
