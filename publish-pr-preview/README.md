# Publish PR Preview
`publish-pr-preview` will publish packages with the changes proposed in the pull request so that developers do not need for it to be reviewed, approved, and merged. Once the preview packages are published the action generates a comment with instructions on how to access the packages.

## Monorepo Support
This action now supports monorepos and will do all of the heavy lifting without burdening the developer with any complicated setup process. The action automatically detects which files have been modified and will only publish packages that have changes proposed as to not use up unnecessary resources.

## Requirements
- Meant to only run on a pull request
- Pass in `GITHUB_TOKEN`
- Optional: Specify `IGNORE` argument for directory of packages you don't want published for monorepos
  - Directories specified in `.gitignore` won't be processed to begin with so for example if you don't want to include `./node_modules` and it's already included in your `.gitignore` file then there's no need to add it to the `IGNORE` arg in the workflow
  - Packages that have sub-packages within its directory will intentionally skip during the publish process.
- Optional: Passing in an argument for `NPM_PUBLISH` will run that command instead of `npm publish` for every package that this action tries to publish.

### Private Dependencies
If your project has package dependencies from private organizations, you must make sure that the repository is configured so it has access to those organizations.

### Authentication for Publishing
In order for this action to be able to successfully publish, it must authenticate somehow. Configure your project and pass in its respective access token as an environment variable in the workflow configuration.

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
```
