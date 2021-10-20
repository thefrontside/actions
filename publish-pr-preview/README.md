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
    - uses: thefrontside/publish-pr-preview@main
      env:
        NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}
        GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

### Checkout needs to have fetch-depth
https://github.com/actions/checkout#fetch-all-history-for-all-tags-and-branches

<!-- ### Publishing to other registries with setup-node
Use `setup-node` for publishing to other package registeries (but this hasn't been tested)
```yml
    - uses: actions/setup-node@v2
      with:
        registry-url: 'https://registry.npmjs.org'
        https://github.com/actions/setup-node/blob/main/docs/advanced-usage.md#publish-to-npmjs-and-gpr-with-npm
``` -->
