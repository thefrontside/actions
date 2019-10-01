# Commit Push and Tag Release
This action commits the file according to the `add` argument and pushes it to your repository.

This action is specifically tailored to run *on* the repository after its automated commit triggered by a merge of a pull request.

## Requirements
You must specify the file you want pushed to your repository as an `add` argument and also expose your `GITHUB_TOKEN`.

## Usage
```yaml
jobs:
  job_name:
    name: Job Name
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v1
    - name: Commit Push and Tag Release
      uses: thefrontside/actions/commit-push-and-tag-release@master
      with:
        add: package.json
      env:
        GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```