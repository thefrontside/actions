# Compute Major Minor or Patch
This action takes in an argument of `PR_LABELS` and outputs one label that is appropriate for `npm version` as an environment variable `$MAJOR_OR_MINOR_OR_PATCH`.

## Requirements
You must pass in a `PR_LABELS` argument.

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
    - name: Compute Major Minor or Patch
      uses: thefrontside/actions/compute-major-minor-or-patch@master
      with:
        PR_LABELS: ${{ steps.fetch-pull-request-labels.outputs.PR_LABELS }}
    - run: echo $MAJOR_OR_MINOR_OR_PATCH
```

## Development
Since this action was built with Javascript, per the [documentation](https://help.github.com/en/articles/creating-a-javascript-action#commit-and-push-your-action-to-github), any changes made to this action must be re-compiled with `@zeit/ncc`.

In your terminal:
```bash
$ npm i -g @zeit/ncc
$ npm install
$ ncc build main.js
```