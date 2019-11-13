# Publish PR Preview
`publish-pr-preview` will publish packages with the changes proposed in the pull request so that developers do not need for it to be reviewed, approved, and merged. Once the preview packages are published the action generates a comment with instructions on how to access the packages.

## Monorepo Support
This action now supports monorepos and will do all of the heavy lifting without burdening the developer with any complicated setup process. The action automatically detects which files have been modified and will only publish packages that have changes proposed as to not use up unnecessary resources.

## Package Registry
The registry to which the packages will be published is determined by the `publishConfig` settings in the `package.json` file. If you wish to publish to `Github Package Registry`, please include the following in your `package.json` file for each of the packages in your repository:
```
{
  "publishConfig": {
    "registry": "https://npm.pkg.github.com/"
  }
}
```
Without this configuration, the action will default to publishing to `npmjs` and will require `NPM_AUTH_TOKEN` to be passed in through the workflow.

## Requirements
- Meant to only run on a pull request
- Pass in `GITHUB_TOKEN`
- Pass in `NPM_AUTH_TOKEN`
- Optional: `NPM_PUBLISH` argument is available if you want to run a different command
  - `npm publish` will run as default
- Optional: Specify `IGNORE` argument for directory of packages you don't want published for monorepos
  - Directories specified in `.gitignore` won't be processed to begin with so for example if you don't want to include `./node_modules` and it's already included in your `.gitignore` file then there's no need to add it to the `IGNORE` arg in the workflow
  - Packages that have sub-packages within its directory will intentionally skip during the publish process.

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
        NPM_PUBLISH: npm run my-script
        IGNORE: folder/example_package folder/example_package2
      env:
        GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        NPM_AUTH_TOKEN: ${{ secrets.NPM_AUTH_TOKEN }}
```
