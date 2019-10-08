# Synchronize with NPM
This action will push a tag to Github and then publish to NPM after it confirms the package version has not been published already.

## Requirements
You must pass in your `GITHUB_TOKEN` and `NPM_AUTH_TOKEN`. Remember to add `NPM_AUTH_TOKEN` in your repository secrets.

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
      env:
        GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        NPM_AUTH_TOKEN: ${{ secrets.NPM_AUTH_TOKEN }}
```