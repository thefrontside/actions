# Fetch Pull Request Labels
This action retrieves the labels of a pull request and outputs them as `PR_LABELS` available between steps within a job. Remember to declare an `id` so that the results can be accessible.

This action is meant to run on a workflow that is triggered by the commit of a merged pull request because it looks for the pull request based on the commit message.

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
    - name: Fetch Pull Request Labels
      uses: thefrontside/actions/fetch-pull-request-labels@master
      id: fetch-pull-request-labels
      with:
        GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
    - run: echo ${{ steps.fetch-pull-request-labels.outputs.PR_LABELS }}
```

## Development
Since this action was built with Javascript, per the [documentation](https://help.github.com/en/articles/creating-a-javascript-action#commit-and-push-your-action-to-github), any changes made to this action must be re-compiled with `@zeit/ncc`.

In your terminal:
```bash
$ npm install
$ npm i -g @zeit/ncc
$ ncc build main.js
```