# Mono Publish
<!-- This action will authenticate for Github Package Registry and loop over the `PACKAGES` argument to publish each package with the branch name as its tag. Once the action is done publishing, it will generate a comment (if this action is run on a pull request) with instructions on how to access each package. --> rewrite

## Requirements
- Pass in `GITHUB_TOKEN` for authentication
  - Currently tailored for Github Package Registry and not NPMJS
- Specify `IGNORE` argument for directory of packages you don't want published
  - Directories specified in .gitignore won't be processed to begin with so for example if you don't want to include `./node_modules` and it's already included in your `.gitignore` then there's no point in adding it into the `IGNORE` arg.

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
