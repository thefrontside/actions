# Publish PR Preview
This action will publish packages with the changes proposed in the pull request so that developers do not need for it to be reviewed, approved, and merged. Once the preview packages are published the action generates a comment with instructions on how to access the packages.

## Monorepo Support
This action now supports monorepos and will do all of the heavy lifting without burdening the developer with any complicated setup process. The action automatically detects which files have been modified and will only publish packages that have changes proposed as to not use up unnecessary resources.

## Requirements
- Meant to only run on a pull request
- Pass in `GITHUB_TOKEN`
- Pass in `NPM_AUTH_TOKEN`
- Optional: Set `GPR` to true if you want to use Github Package Registry otherwise it will publish to `npmjs`
  - Setting `GPR` to true would mean you do not need to pass in `NPM_AUTH_TOKEN`
- Optional: `NPM_PUBLISH` argument is available if you want to run a different command
  - `npm publish` will run as default
- Optional: Specify `IGNORE` argument for directory of packages you don't want published for monorepos
  - Directories specified in `.gitignore` won't be processed to begin with so for example if you don't want to include `./node_modules` and it's already included in your `.gitignore` file then there's no need to add it to the `IGNORE` arg in the workflow
  - Root is intentionally not recognized as an argument because in the case of a monorepo it will automatically skip root during its publishing process. And for the case where it is a single repository, we should not be skipping root.

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
