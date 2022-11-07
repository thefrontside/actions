# Frontside Actions
The Frontside Actions is a collection of Github Actions we use in Transparent NPM Publishing.

## Actions
The following are our current actions. Go to its directories for a more detailed instructions on how to use them.

| Actions | Description |
| ------- | ----------- |
| [publish-pr-preview](/publish-pr-preview) | Publish preview package(s) from pull request to NPM. |
| [synchronize-npm-tags](/synchronize-npm-tags) | Remove unwanted tags from NPM. |
| [synchronize-with-npm](/synchronize-with-npm) | Push tag to Github and Publish to NPM. |

## Local Debugging of Actions

Testing actions by pushing commits to repositories is a waste of time and steals your soul. You can run actions locally with [act](https://github.com/nektos/act) when debugging actions in repositories that use them. 

In this example, I'll be debugging preview workflow in `test-preview-builds` branch of `thefrontside/playhouse` repository.

### Testing workflows that run on pull_request

```bash
act pull_request --job <name_of_job> \
  -s NODE_AUTH_TOKEN=${NODE_AUTH_TOKEN} \
  -s GITHUB_TOKEN=${GITHUB_TOKEN} \
  --container-architecture linux/amd64 \ # this is for running on ARM Macs
  -P ubuntu-latest=node:16-bullseye-slim # runner that has yarn installed
  -e payload.json \
```

Example of `payload.json`

```json
{
  "pull_request": {
    "head": {
      "ref": "test-preview-builds",
      "repo": {
        "url": "https://api.github.com/repos/thefrontside/playhouse"
      }
    },
    "base": {
      "ref": "main",
      "repo": {
        "url": "https://api.github.com/repos/thefrontside/playhouse"
      }
    }
  }
}
```
