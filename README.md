# Frontside Actions
The Frontside Actions is a collection of Github Actions we use in Transparent NPM Publishing.

## Actions
The following are our current actions. Go to its directories for a more detailed instructions on how to use them.

| Actions | Description |
| ------- | ----------- |
| [commit-push-and-tag-release](/commit-push-and-tag-release) | Commit and push the file that is specified as an argument. |
| [compute-major-minor-or-patch](/compute-major-minor-or-patch) | Takes in an array of labels and returns either `major`, `minor`, or `patch` as an environment variable. |
| [fetch-pull-request-labels](/fetch-pull-request-labels) | Retrieves and outputs labels of a pull request. |
| [merge-and-fork-detector](/merge-and-fork-detector) | Halts workflow for certain scenarios for open source projects. |
| [post-npm-usage-instructions-comment](/post-npm-usage-instructions-comment) | Generate comment on pull request with instructions on how to use the newly published package. |
| [write-npm-snapshot-version](/write-npm-snapshot-version) | Updates package version in `package.json` with the SHA of the current commit. |
