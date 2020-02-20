# Synchronize with NPM
This action will automatically detect which packages of a monorepo have changed to determine which packages to publish (and works fine with single repositories too).

The action will not publish packages that has a `package.json` within its sub-directories.

## Requirements
- Pass in `secrets.GITHUB_TOKEN` into `GITHUB_TOKEN`.
  - :exclamation: Must be `GITHUB_TOKEN` and not a personal access token of a bot. :exclamation:
- Pass in `NPM_TOKEN`.
- Optional: Specify `IGNORE` argument for directory of packages you don't want published.
- Optional: `NPM_PUBLISH` argument is available if you want to run a different command. `npm publish` will run as default.
  - :warning: However, if you provide this argument, it will run that script to publish for every package. :warning:

## Usage
```yaml
jobs:
  job_name:
    name: Job Name
    runs-on: ubuntu-16.04
    steps:
    - uses: actions/checkout@v1
    - name: Syncrhonize with NPM
      uses: thefrontside/actions/synchronize-with-npm@master
      with:
        NPM_PUBLISH: npm run my-script
      env:
        GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        NPM_TOKEN: ${{ secrets.NPM_TOKEN }}
```
