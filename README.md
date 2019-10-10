# Frontside Actions
The Frontside Actions is a collection of Github Actions we use in Transparent NPM Publishing.

## Actions
The following are our current actions. Go to its directories for a more detailed instructions on how to use them.

| Actions | Description |
| ------- | ----------- |
| [npm-publish-branch-preview](/npm-publish-branch-preview) | Publish package with tag using the name of the head branch.|
| [post-npm-usage-instructions-comment](/post-npm-usage-instructions-comment) | Generate comment on pull request with instructions on how to use the newly published package. |
| [synchronize-npm-tags](/synchronize-npm-tags) | Remove unwanted tags from NPM. |
| [synchronize-with-npm](/synchronize-with-npm) | Push tag to Github and Publish to NPM. |
| [write-npm-snapshot-version](/write-npm-snapshot-version) | Updates package version in `package.json` with the SHA of the current commit. |