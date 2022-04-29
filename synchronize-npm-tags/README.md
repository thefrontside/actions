# Synchronize NPM Tags

The `synchronize-npm-tags` action was created to be used in tandem with our [`publish-pr-preview`](../publish-pr-preview) action which publishes preview packages with NPM tags that are generated from branch names. Unless you remove stale tags manually, those NPM tags will keep accumulating. To address this inconvenience, the `synchronize-npm-tags` action will remove NPM tags that do not correspond to any of the git branches of your repository.

By default the action will not remove common tags such as `dev`, `beta`, `alpha`, and `latest`. You can also specify your own list of tags that you wish to preserve. See below for details.

## Usage

```yaml
jobs:
  synchronize-tags:
    name: Synchronize NPM Tags
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v2
      with:
        fetch-depth: 0
          ## https://github.com/actions/checkout#fetch-all-history-for-all-tags-and-branches
    - uses: actions/setup-node@v2
      with:
        registry-url: https://registry.npmjs.org
          ## https://github.com/actions/setup-node/blob/main/docs/advanced-usage.md#publish-to-npmjs-and-gpr-with-npm
    - uses: thefrontside/actions/synchronize-npm-tags@main
      env:
        NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}
        GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

### Specifying NPM Tags to Preserve

```yaml
- uses: thefrontside/actions/synchronize-npm-tags@main
  with:
    PRESERVE: tag1 tag2 tag3
  env:
    NODE_AUTH_TOKEN: ...
    GITHUB_TOKEN: ...
```
