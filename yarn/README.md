<!-- # Synchronize NPM Tags
`synchronize-npm-tags` is part of our Transparent Publishing workflow and is meant to be triggered `on: delete`. This action will cross-reference the NPM dist-tags with branch names and remove the tags that we no longer need (with the exception of `latest` and any other tag labels that are passed in as the `preserve` argument).

For instance, let's say we have a pull request that published a package with the tag of `foo-bar`. After we merge the pull request and delete the branch, this action will be triggered and see that "foo-bar" exists as a tag but there's no corresponding branch so it will remove that tag from the registry.

## Requirements
- Pass in `NPM_TOKEN`.
- Optional: You can specify any NPM tags you'd like to `preserve`.

## Usage
```yaml
jobs:
  job_name:
    name: Job Name
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v1
    - uses: thefrontside/actions/synchronize-npm-tags@master
      with:
        preserve: dev beta alpha
      env:
        NPM_TOKEN: ${{ secrets.NPM_TOKEN }}
``` -->
