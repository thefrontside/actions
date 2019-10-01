# Post Instruction Comment
This action will generate a comment on a PR using [DangerJS](https://github.com/danger/danger-js). The message is preset with instructions on how to access the package that was published from the latest commit of the PR. The message was tailored to be relevant to the `TNP PR Create` workflow.

## Requirements
You must pass in your `GITHUB_TOKEN` as shown below.

## Usage
```yaml
jobs:
  job_name:
    name: Job Name
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@master
    - name: Post Instruction Comment
      uses: thefrontside/actions/post-instruction-comment@master
      env: 
        GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

## Development
In the future this action could make the comment content dynamic with user input with otherwise default message for TNP, In the meantime if you would like to customize the comment, you can clone the action and modify the message directly in `entrypoint.sh`.