# Synchronize with NPM
This action will review all the available packages and see if the user intends on publishing any of them by evaluating if the current package version exists.

:star: NEW :star: deprecation feature: See below in `Deprecate Packages` section below.

## Requirements
- Pass in `secrets.GITHUB_TOKEN` into `GITHUB_TOKEN`.
  - :exclamation: Must be `GITHUB_TOKEN` and not a personal access token of a bot. :exclamation:
- Pass in `NPM_TOKEN`.
- Optional: Specify `IGNORE` argument for directory of packages you don't want published.
- Optional: `NPM_PUBLISH` argument is available if you want to run a different command. `npm publish` will run as default.
  - :warning: However, if you provide this argument, it will run that script to publish for every package (if you're running this action on a monorepo). If you would need to run a custom command once for the repository and not each individual packages, use `BEFORE_ALL` (see below).
- Optional: Passing in an argument for `BEFORE_ALL` will run that command after `npm install` or `yarn install` but before the action starts navigating into the different packages in the monorepo to start the publishign process.

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
        BEFORE_ALL: npm run prepack-after-install
        NPM_PUBLISH: npm run my-script
        IGNORE: packages/to/ignore
      env:
        GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        NPM_TOKEN: ${{ secrets.NPM_TOKEN }}
```

## Deprecate Packages
When a package in a monorepo needs to be deprecated, this action will take care of that. All you need to do is add `"deprecate": "deprecation message"` inside the `package.json` of the package you wish to deprecate on NPM.
