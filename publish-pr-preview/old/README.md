# Publish PR Preview
`publish-pr-preview` will publish packages with the changes proposed in the pull request so that developers do not need for it to be reviewed, approved, and merged. Once the preview packages are published the action generates a comment with instructions on how to access the packages.

## Monorepo Support
This action now supports monorepos and will do all of the heavy lifting without burdening the developer with any complicated setup process. The action automatically detects which files have been modified and will only publish packages that have changes proposed as to not use up unnecessary resources.

## Requirements
- Meant to only run on a pull request
- Pass in `GITHUB_TOKEN`
- Pass in `NPM_TOKEN`
- Optional: Specify `IGNORE` argument for directory of packages you don't want published for monorepos
  - Directories specified in `.gitignore` won't be processed to begin with so for example if you don't want to include `./node_modules` and it's already included in your `.gitignore` file then there's no need to add it to the `IGNORE` arg in the workflow
  - Packages that have sub-packages within its directory will intentionally skip during the publish process.
- Optional: Passing in an argument for `NPM_PUBLISH` will run that command instead of `npm publish`.
  - :warning: However, if you provide this argument, it will run that script to publish for every package (if you're running this action on a monorepo). If you would need to run a custom command once for the repository and not each individual packages, use `BEFORE_ALL` (see below).
- Optional: Passing in an argument for `BEFORE_ALL` will run that command after `npm install` or `yarn install` but before the action starts navigating into the different packages in the monorepo to start the publishign process.

### Private Dependencies
If your project has package dependencies from private organizations, you must make sure that the repository is configured so it has access to those organizations.

### Registry for Publishing
By default this action will attempt to publish to `npmjs`. If you wish to publish to a different registry, you must configure that yourself and pass in the appropriate token from your repository's secrets through the workflow configuration.`

## Usage
```yaml
jobs:
  job_name:
    name: Job Name
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v1
    - name: Publish PR Preview
      uses: thefrontside/actions/publish-pr-preview@master
      with:
        BEFORE_ALL: npm run prepack-after-install
        NPM_PUBLISH: npm run my-script
        IGNORE: folder/example_package folder/example_package2
      env:
        GITHUB_TOKEN: ${{ secrets.PERSONAL_ACCESS_TOKEN }}
        NPM_TOKEN: ${{ secrets.NPM_TOKEN }}
```
