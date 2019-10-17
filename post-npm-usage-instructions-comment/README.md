# Post NPM Usage Instructions Comment
This action will generate a comment on a PR using [DangerJS](https://github.com/danger/danger-js). The message is preset with instructions on how to access the package that was published from the latest commit of the PR.

## Requirements
- Pass in `GITHUB_TOKEN`.

## Usage
```yaml
jobs:
  job_name:
    name: Job Name
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v1
    - name: Post Instructions Comment
      uses: thefrontside/actions/post-npm-usage-instructions-comment@master
      env: 
        GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

## Development
In the future this action could make the comment content dynamic with user input, In the meantime if you would like to customize the comment, you can clone the action and modify the message directly in `entrypoint.sh`.