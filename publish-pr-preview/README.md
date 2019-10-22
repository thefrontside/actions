# Publish PR Preview
This action will:
- Check for accessibility to NPM token in secrets.
- Make sure this action is being run from a pull request.
- Make sure the name of the head branch of the pull request isn't `latest` to avoid conflicts with NPM tagging.
- Update package version with snapshot, publish to NPM with branch name as tag.
- Comment on pull request with instructions on how to access the package.

## Requirements
- Pass in `GITHUB_TOKEN` and `NPM_AUTH_TOKEN`.
- Optional: `NPM_PUBLISH` argument is available if you want to run a different command. `npm publish` will run as default.

## Usage
```yaml`
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
      env:
        GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        NPM_AUTH_TOKEN: ${{ secrets.NPM_AUTH_TOKEN }}
```
