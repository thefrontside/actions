# Synchronize With NPM

The `synchronize-with-npm` action will publish your packages after running `npm view` for each package in your monorepo or repository to check to see if the version of your packages have been published yet. This action can also deprecating packages on NPM. See below for details.

## Usage

```yaml
on:
  push:
    branches:
      - main

jobs:
  release:
    name: Publish Releases
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v3
    - uses: actions/step-node@v2
      with:
        registry-url: https://registry.npmjs.org
          ## https://github.com/actions/setup-node/blob/main/docs/advanced-usage.md#publish-to-npmjs-and-gpr-with-npm
    - uses: thefrontside/actions/synchronize-with-npm@v2
      with:
        # PUBLISH_SCRIPT: yarn publish --access=public
      env:
        NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}
        GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

### Specifying Install Script

The action will by default run either `yarn install --frozen-lockfile` or `npm ci`, but if there are additional steps required before your packages can be published, you can specify your own install script that runs at the root of your repository:

```yaml
- uses: thefrontside/actions/synchronize-with-npm@v2
  with:
    INSTALL_SCRIPT: yarn my_install_command
  env:
    NODE_AUTH_TOKEN: ...
    GITHUB_TOKEN: ...
```

### Deprecating Packages

If you wish to deprecate any of your packages, you can simply update your `package.json` with a `deprecate` property and provide it with a deprecation message:

```json
{
  "name": "package-to-deprecate",
  "version": "1.0.0",
  "deprecate": "This package has been deprecated"
}
```
