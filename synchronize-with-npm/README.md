# Synchronize with NPM
This action will push a tag to Github and then publish to NPM after it confirms the package version has not been published already.

## Requirements
- Pass in `GITHUB_TOKEN`. 
- Pass in `NPM_AUTH_TOKEN`.
- Optional: `NPM_PUBLISH` argument is available if you want to run a different command. `npm publish` will run as default.

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
        NPM_AUTH_TOKEN: ${{ secrets.NPM_AUTH_TOKEN }}
```