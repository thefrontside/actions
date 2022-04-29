# Publish PR Preview

The `publish-pr-preview` action will detect which packages have changes in your pull request and publish those packages as prereleases to NPM.

## Usage

```yaml
on: pull_request
jobs:
  preview:
    name: Publish Previews
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
    - uses: thefrontside/actions/publish-pr-preview@main
      env:
        NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}
        GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

### Specifying Install Script

The action will by default run either `yarn install --frozen-lockfile` or `npm ci`, but if there are additional steps required before your packages can be published, you can specify your own install script that runs at the root of your repository:

```yaml
- uses: thefrontside/actions/publish-pr-preview@main
  with:
    INSTALL_SCRIPT: yarn my_install_command
  env:
    NODE_AUTH_TOKEN: ...
    GITHUB_TOKEN: ...
```
